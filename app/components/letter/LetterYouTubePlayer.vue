<script setup lang="ts">
import { parseYouTubeLink } from '#shared/letters/youtube'

/**
 * Audio-only soundtrack player.
 * Uses the YouTube IFrame API under the hood (no video UI) with a custom play bar.
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
const title = ref<string | null>(null)
const error = ref<string | null>(null)

interface YTPlayer {
  playVideo: () => void
  pauseVideo: () => void
  stopVideo: () => void
  destroy: () => void
  getPlayerState: () => number
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

async function fetchTitle(openUrl: string) {
  try {
    // oEmbed is public and CORS-friendly for youtube.com
    const data = await $fetch<{ title?: string }>(
      `https://www.youtube.com/oembed`,
      { query: { url: openUrl, format: 'json' } },
    )
    if (data?.title)
      title.value = data.title
  }
  catch {
    title.value = null
  }
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
  destroyPlayer()
})
</script>

<template>
  <div
    v-if="resource"
    class="letter-audio w-full"
  >
    <!-- Visually hidden YouTube host (audio only) -->
    <div
      ref="hostEl"
      class="pointer-events-none absolute size-px overflow-hidden opacity-0"
      aria-hidden="true"
    />

    <div
      class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-3 backdrop-blur-sm"
    >
      <button
        type="button"
        class="grid size-11 shrink-0 place-items-center rounded-full bg-white text-neutral-900 transition-transform active:scale-95 disabled:opacity-40"
        :disabled="!ready && !error"
        :aria-label="playing ? 'Pause soundtrack' : 'Play soundtrack'"
        @click="togglePlay"
      >
        <UIcon
          :name="playing ? 'i-lucide-pause' : 'i-lucide-play'"
          class="size-5"
          :class="!playing && 'ml-0.5'"
        />
      </button>

      <div class="min-w-0 flex-1">
        <p class="font-type text-[0.55rem] uppercase tracking-[0.18em] text-white/40">
          Soundtrack
        </p>
        <p class="mt-0.5 truncate font-display text-sm text-white/90">
          {{ error || title || 'YouTube audio' }}
        </p>
        <!-- Equalizer bars -->
        <div
          class="letter-audio-eq mt-1.5 flex h-3 items-end gap-0.5"
          :class="playing ? 'is-playing' : ''"
          aria-hidden="true"
        >
          <span
            v-for="n in 5"
            :key="n"
            class="letter-audio-eq__bar"
          />
        </div>
      </div>

      <a
        :href="resource.openUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="shrink-0 font-type text-[0.55rem] uppercase tracking-[0.12em] text-white/35 hover:text-white/70 transition-colors"
        title="Open on YouTube"
      >
        YT ↗
      </a>
    </div>
  </div>
</template>

<style scoped>
.letter-audio-eq__bar {
  display: block;
  width: 3px;
  height: 4px;
  border-radius: 1px;
  background: color-mix(in srgb, #fff 35%, transparent);
  transition: height 0.15s ease;
}

.letter-audio-eq.is-playing .letter-audio-eq__bar {
  background: color-mix(in srgb, #f87171 80%, #fff);
  animation: letter-audio-eq 0.85s ease-in-out infinite;
}

.letter-audio-eq.is-playing .letter-audio-eq__bar:nth-child(1) {
  animation-delay: 0s;
}
.letter-audio-eq.is-playing .letter-audio-eq__bar:nth-child(2) {
  animation-delay: 0.12s;
}
.letter-audio-eq.is-playing .letter-audio-eq__bar:nth-child(3) {
  animation-delay: 0.05s;
}
.letter-audio-eq.is-playing .letter-audio-eq__bar:nth-child(4) {
  animation-delay: 0.18s;
}
.letter-audio-eq.is-playing .letter-audio-eq__bar:nth-child(5) {
  animation-delay: 0.08s;
}

@keyframes letter-audio-eq {
  0%,
  100% {
    height: 4px;
  }
  50% {
    height: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .letter-audio-eq.is-playing .letter-audio-eq__bar {
    animation: none;
    height: 8px;
  }
}
</style>
