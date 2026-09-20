<script setup lang="ts">
import { parseYouTubeLink } from '#shared/letters/youtube'

/**
 * Compact music review row for the office letter queue.
 * Fetches YouTube oEmbed title so moderators can vet song choice without leaving the page.
 */
const props = defineProps<{
  music: string
}>()

const resource = computed(() => parseYouTubeLink(props.music))

const title = ref<string | null>(null)
const artist = ref<string | null>(null)
const metaPending = ref(false)

async function loadMeta(openUrl: string) {
  metaPending.value = true
  title.value = null
  artist.value = null
  try {
    const data = await $fetch<{ title?: string, author_name?: string }>(
      'https://www.youtube.com/oembed',
      { query: { url: openUrl, format: 'json' } },
    )
    title.value = data?.title ?? null
    artist.value = data?.author_name ?? null
  }
  catch {
    // leave null — link still works
  }
  finally {
    metaPending.value = false
  }
}

watch(
  resource,
  (res) => {
    if (res) {
      loadMeta(res.openUrl)
    }
    else {
      title.value = null
      artist.value = null
    }
  },
  { immediate: true },
)
</script>

<template>
  <div
    v-if="resource"
    class="flex items-center gap-3 rounded-md bg-elevated/50 p-3"
  >
    <UIcon name="ph:music-notes" class="size-4 shrink-0 text-dimmed" />
    <div class="min-w-0 flex-1">
      <p class="text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
        Song choice
      </p>
      <p v-if="metaPending" class="truncate text-sm text-muted">
        Loading title…
      </p>
      <template v-else>
        <p class="truncate text-sm font-medium text-highlighted">
          {{ title ?? 'YouTube video' }}
        </p>
        <p v-if="artist" class="truncate text-xs text-muted">
          {{ artist }}
        </p>
      </template>
    </div>
    <UButton
      :to="resource.openUrl"
      target="_blank"
      rel="noopener noreferrer"
      color="neutral"
      variant="outline"
      size="sm"
      trailing-icon="ph:arrow-up-right"
      class="shrink-0"
    >
      Listen
    </UButton>
  </div>
</template>
