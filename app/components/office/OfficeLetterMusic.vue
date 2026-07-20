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
    class="flex items-start gap-3 rounded-xl border border-neutral-200 bg-white/70 px-3 py-2.5"
  >
    <div class="grid size-9 shrink-0 place-items-center rounded-lg bg-red-50 text-red-600">
      <UIcon name="i-lucide-music-2" class="size-4" />
    </div>
    <div class="min-w-0 flex-1">
      <p class="text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-500">
        Song choice
      </p>
      <p v-if="metaPending" class="truncate text-sm text-neutral-500">
        Loading title…
      </p>
      <template v-else>
        <p class="truncate text-sm font-medium text-neutral-900">
          {{ title ?? 'YouTube video' }}
        </p>
        <p v-if="artist" class="truncate text-xs text-neutral-600">
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
      trailing-icon="i-lucide-external-link"
      class="shrink-0"
    >
      Listen
    </UButton>
  </div>
</template>
