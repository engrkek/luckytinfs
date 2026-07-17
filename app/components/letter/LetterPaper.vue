<script setup lang="ts">
import type { LetterDesign, LetterRecipient } from '#shared/letters/types'
import { fontOf, paperOf, RECIPIENT_THEME } from '#shared/letters/visuals'

const props = withDefaults(defineProps<{
  recipient: LetterRecipient
  senderName: string
  body: string
  design: LetterDesign
  compact?: boolean
  /** Show blinking caret at end of body (typewriter) */
  typing?: boolean
  /**
   * 0–1 typing progress. Stickers appear when the “pen” reaches their Y.
   * Omit / 1 = show all; 0 = hide all.
   */
  stickerProgress?: number
}>(), {
  stickerProgress: 1,
})

const paper = computed(() => paperOf(props.design.background))
const fontClass = computed(() => fontOf(props.design.font))
const theme = computed(() => RECIPIENT_THEME[props.recipient])

/** Vertical threshold 0–100; stickers at/above this Y stay hidden until progress catches up */
const revealY = computed(() => {
  const p = props.stickerProgress
  if (p >= 1)
    return 100
  if (p <= 0)
    return -1
  // Slight lead so stickers pop just as the line reaches them
  return p * 100 + 6
})

const visibleStickers = computed(() =>
  props.design.stickers
    .map((sticker, index) => ({ sticker, index }))
    .filter(({ sticker }) => sticker.y <= revealY.value),
)

const paperStyle = computed(() => {
  const base: Record<string, string> = { color: paper.value.ink }
  if (paper.value.src) {
    base.backgroundImage = `url(${paper.value.src})`
    base['--paper-wash'] = String(paper.value.wash ?? 0.3)
  }
  return base
})
</script>

<template>
  <article
    class="letter-paper relative overflow-hidden rounded-sm"
    :class="[
      paper.class,
      compact ? 'p-5 sm:p-6' : 'p-6 sm:p-9',
    ]"
    :style="paperStyle"
  >
    <div class="relative z-2 flex items-start justify-between gap-3 mb-5 sm:mb-7">
      <div>
        <p class="font-type text-[0.65rem] uppercase tracking-[0.22em] opacity-55">
          Signals World Tour ’26
        </p>
        <p
          class="mt-1 font-display text-lg sm:text-xl font-medium tracking-tight"
          :style="{ color: theme.deep }"
        >
          {{ theme.toLine }}
        </p>
      </div>
    </div>

    <div class="relative z-2 min-h-40">
      <LetterSticker
        v-for="{ sticker, index } in visibleStickers"
        :key="`${sticker.id}-${index}`"
        :sticker="sticker"
        class="letter-sticker-enter"
      />

      <div
        class="relative whitespace-pre-wrap text-pretty leading-relaxed"
        :class="[
          fontClass,
          design.font === 'script' ? 'text-xl sm:text-2xl leading-snug' : 'text-base sm:text-lg',
          design.font === 'type' ? 'text-[0.95rem] sm:text-base leading-[1.7]' : '',
        ]"
      >
        <span>{{ body }}</span><span
          v-if="typing"
          class="letter-caret"
          aria-hidden="true"
        />
      </div>
    </div>

    <footer class="relative z-2 mt-8 sm:mt-10 pt-4 border-t border-current/10">
      <p class="font-type text-[0.6rem] uppercase tracking-[0.18em] opacity-50">
        With love from
      </p>
      <p
        class="mt-0.5 text-lg sm:text-xl"
        :class="[
          fontClass,
          design.font === 'script' ? 'text-xl sm:text-2xl' : '',
          design.font === 'type' ? 'text-base sm:text-lg' : '',
        ]"
      >
        {{ senderName || 'Anonymous' }}
      </p>
    </footer>
  </article>
</template>
