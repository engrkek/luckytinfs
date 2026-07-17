<script setup lang="ts">
import { parseSpotifyLink } from '#shared/letters/spotify'

const props = withDefaults(defineProps<{
  /** Spotify open URL stored on letter.design.music */
  music?: string | null
  /**
   * Mount the embed with autoplay.
   * Only set true after an explicit user gesture (e.g. “Play with sound”).
   */
  autoplay?: boolean
}>(), {
  autoplay: false,
})

const resource = computed(() => parseSpotifyLink(props.music ?? undefined))

/** Compact Spotify embed — full track (Premium may be required by Spotify). */
const embedSrc = computed(() => {
  if (!resource.value)
    return null
  const url = new URL(resource.value.embedUrl)
  // Spotify embed: autoplay=1 starts the full track after a user gesture.
  if (props.autoplay)
    url.searchParams.set('autoplay', '1')
  return url.toString()
})
</script>

<template>
  <div
    v-if="embedSrc"
    class="letter-spotify-embed w-full overflow-hidden rounded-xl border border-white/10 bg-black/35 shadow-lg"
  >
    <iframe
      :key="embedSrc"
      :src="embedSrc"
      width="100%"
      height="152"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="eager"
      class="block w-full border-0"
      style="min-height: 152px"
      title="Letter soundtrack on Spotify"
    />
  </div>
</template>
