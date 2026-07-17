<script setup lang="ts">
import { parseYouTubeLink } from '#shared/letters/youtube'

/**
 * Minimal audio-only soundtrack bar, fixed to the bottom of the screen:
 * play/pause · progress line · mute. YouTube IFrame API under the hood.
 */

const props = withDefaults(defineProps<{
  /** YouTube watch / share URL stored on letter.design.music */
  music?: string | null
  /**
   * Start playback when ready.
   * Only true after an explicit user gesture (landing sound gate or Play).
   */
  autoplay?: boolean
}>(), {
  autoplay: false,
})

const resource = computed(() => parseYouTubeLink(props.music ?? undefined))

const hostEl = ref<HTMLElement | null>(null)
const playing = ref(false)
const ready = ref(false)
const muted = ref(false)
const progress = ref(0)
const error = ref<string | null>(null)
const title = ref<string | null>(null)
const artist = ref<string | null>(null)

async function fetchTitle(openUrl: string) {
  try {
    // oEmbed is public and CORS-friendly for youtube.com
    const data = await $fetch<{ title?: string, author_name?: string }>(
      `https://www.youtube.com/oembed`,
      { query: { url: openUrl, format: 'json' } },
    )
    title.value = data?.title ?? null
    artist.value = data?.author_name ?? null
  }
  catch {
    title.value = null
    artist.value = null
  }
}

interface YTPlayer {
  playVideo: () => void
  pauseVideo: () => void
  stopVideo: () => void
  destroy: () => void
  getPlayerState: () => number
  getCurrentTime: () => number
  getDuration: () => number
  mute: () => void
  unMute: () => void
}

interface YTPlayerEvent {
  data: number
  target: YTPlayer
}

interface YTNamespace {
  Player: new (
    el: HTMLElement | string,
    opts: Record<string, unknown>,
  ) => YTPlayer
  PlayerState: {
    PLAYING: number
    PAUSED: number
    ENDED: number
    BUFFERING: number
    CUED: number
  }
}

declare global {
  interface Window {
    YT?: YTNamespace
    onYouTubeIframeAPIReady?: () => void
    __ytApiReady?: Promise<void>
  }
}

let player: YTPlayer | null = null

function loadYouTubeApi(): Promise<void> {
  if (import.meta.server)
    return Promise.reject(new Error('SSR'))

  if (window.YT?.Player)
    return Promise.resolve()

  if (window.__ytApiReady)
    return window.__ytApiReady

  window.__ytApiReady = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      resolve()
    }
    if (!document.querySelector('script[data-youtube-iframe-api]')) {
      const s = document.createElement('script')
      s.src = 'https://www.youtube.com/iframe_api'
      s.async = true
      s.dataset.youtubeIframeApi = '1'
      document.head.appendChild(s)
    }
  })

  return window.__ytApiReady
}

function destroyPlayer() {
  try {
    player?.destroy()
  }
  catch {
    // already gone
  }
  player = null
  ready.value = false
  playing.value = false
  progress.value = 0
}

async function mountPlayer() {
  if (!import.meta.client || !resource.value || !hostEl.value)
    return

  destroyPlayer()
  error.value = null
  hostEl.value.innerHTML = ''

  // Inner target YT replaces with iframe
  const target = document.createElement('div')
  target.id = `yt-audio-${resource.value.id}-${Math.random().toString(36).slice(2, 8)}`
  hostEl.value.appendChild(target)

  try {
    await loadYouTubeApi()
    if (!window.YT?.Player)
      throw new Error('YouTube API unavailable')

    const shouldAutoplay = props.autoplay
    const videoId = resource.value.id

    player = new window.YT.Player(target, {
      height: '0',
      width: '0',
      videoId,
      playerVars: {
        autoplay: shouldAutoplay ? 1 : 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        iv_load_policy: 3,
        origin: window.location.origin,
      },
      events: {
        onReady: (e: YTPlayerEvent) => {
          ready.value = true
          if (shouldAutoplay) {
            try {
              e.target.playVideo()
            }
            catch {
              // gesture may have expired — user can press play
            }
          }
        },
        onStateChange: (e: YTPlayerEvent) => {
          const YT = window.YT
          if (!YT)
            return
          playing.value = e.data === YT.PlayerState.PLAYING
            || e.data === YT.PlayerState.BUFFERING
          if (e.data === YT.PlayerState.ENDED)
            progress.value = 1
        },
        onError: () => {
          error.value = 'Couldn’t load this track'
          playing.value = false
        },
      },
    })
  }
  catch {
    error.value = 'Couldn’t start the soundtrack'
  }
}

function togglePlay() {
  if (!player || !ready.value)
    return
  if (playing.value)
    player.pauseVideo()
  else
    player.playVideo()
}

function toggleMute() {
  if (!player || !ready.value)
    return
  if (muted.value)
    player.unMute()
  else
    player.mute()
  muted.value = !muted.value
}

/* Progress line: poll while playing */
let poll: number | undefined

watch(playing, (p) => {
  window.clearInterval(poll)
  if (!p)
    return
  poll = window.setInterval(() => {
    if (!player)
      return
    const duration = player.getDuration() || 0
    progress.value = duration ? player.getCurrentTime() / duration : 0
  }, 500)
})

watch(
  () => [resource.value?.id, props.autoplay] as const,
  async ([id], prev) => {
    if (!id)
      return
    // Remount when track changes; if only autoplay flipped to true, try play
    if (prev && prev[0] === id && props.autoplay && player && ready.value) {
      player.playVideo()
      return
    }
    await nextTick()
    await mountPlayer()
  },
)

watch(
  () => resource.value?.openUrl,
  (url) => {
    title.value = null
    artist.value = null
    if (url)
      fetchTitle(url)
  },
  { immediate: true },
)

onMounted(async () => {
  await nextTick()
  await mountPlayer()
})

onBeforeUnmount(() => {
  window.clearInterval(poll)
  destroyPlayer()
})
</script>

<template>
  <div v-if="resource">
    <!-- Visually hidden YouTube host (audio only) -->
    <div
      ref="hostEl"
      class="pointer-events-none absolute size-px overflow-hidden opacity-0"
      aria-hidden="true"
    />

    <!-- Minimal dock: play/pause · progress line · mute -->
    <div class="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0c0e12]/85 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div class="mx-auto flex max-w-lg items-center gap-4 px-5 py-2.5">
        <button
          type="button"
          class="grid size-9 shrink-0 place-items-center rounded-full bg-white text-neutral-900 transition-transform active:scale-95 disabled:opacity-40"
          :disabled="!ready || !!error"
          :aria-label="playing ? 'Pause soundtrack' : 'Play soundtrack'"
          @click="togglePlay"
        >
          <UIcon
            :name="playing ? 'i-lucide-pause' : 'i-lucide-play'"
            class="size-4"
            :class="!playing && 'ml-0.5'"
          />
        </button>

        <div class="min-w-0 flex-1">
          <p class="mb-1.5 truncate text-xs text-white/70">
            {{ error || title || 'YouTube audio' }}<span
              v-if="!error && artist"
              class="text-white/40"
            > — {{ artist }}</span>
          </p>
          <div
            class="h-0.5 overflow-hidden rounded-full bg-white/15"
            role="progressbar"
            :aria-valuenow="Math.round(progress * 100)"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div
              class="h-full rounded-full bg-white/80 transition-[width] duration-500 ease-linear"
              :style="{ width: `${progress * 100}%` }"
            />
          </div>
        </div>

        <button
          type="button"
          class="grid size-9 shrink-0 place-items-center rounded-full text-white/60 transition-colors hover:text-white disabled:opacity-40"
          :disabled="!ready || !!error"
          :aria-label="muted ? 'Unmute soundtrack' : 'Mute soundtrack'"
          @click="toggleMute"
        >
          <UIcon
            :name="muted ? 'i-lucide-volume-x' : 'i-lucide-volume-2'"
            class="size-4.5"
          />
        </button>
      </div>
    </div>
  </div>
</template>
