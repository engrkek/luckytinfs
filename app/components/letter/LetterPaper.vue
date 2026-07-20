<script setup lang="ts">
import type { LetterDesign, LetterRecipient } from '#shared/letters/types'
import { fontOf, paperOf, RECIPIENT_THEME } from '#shared/letters/visuals'

const props = withDefaults(defineProps<{
  recipient: LetterRecipient
  senderName: string
  /**
   * Full letter body — always used for layout height so the paper
   * doesn’t grow while typing (and stickers don’t drift).
   */
  body: string
  /**
   * Visible text during typewriter. Defaults to full `body`.
   * When shorter than `body`, the remainder is invisible but still occupies space.
   */
  revealedBody?: string
  design: LetterDesign
  compact?: boolean
  /** 'postcard' = landscape 3:2, meta+signature on the left, message on the right */
  layout?: 'letter' | 'postcard'
  /** Show blinking caret at end of revealed text */
  typing?: boolean
  /**
   * 0–1 typing progress. Stickers appear when the “pen” reaches their Y
   * on the full-height letter.
   */
  stickerProgress?: number
}>(), {
  stickerProgress: 1,
  layout: 'letter',
})

const paper = computed(() => paperOf(props.design.background))
const fontClass = computed(() => fontOf(props.design.font))
const theme = computed(() => RECIPIENT_THEME[props.recipient])

const visibleText = computed(() => props.revealedBody ?? props.body)

/** Remainder after the caret — keeps full height without showing untyped characters */
const ghostTail = computed(() => {
  if (!props.typing)
    return ''
  const full = props.body
  const shown = visibleText.value
  if (shown.length >= full.length)
    return ''
  return full.slice(shown.length)
})

/** Vertical threshold 0–100 on the fixed full-height body area */
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

const bodyTypeClass = computed(() => [
  fontClass.value,
  props.design.font === 'script' ? 'text-xl sm:text-2xl leading-snug' : 'text-base sm:text-lg',
  props.design.font === 'type' ? 'text-[0.95rem] sm:text-base leading-[1.7]' : '',
])
</script>

<template>
  <article
    class="letter-paper relative overflow-hidden rounded-sm"
    :class="[
      paper.class,
      layout === 'postcard' ? 'flex h-full gap-4 p-4 sm:p-5' : (compact ? 'p-5 sm:p-6' : 'p-6 sm:p-9'),
    ]"
    :style="paperStyle"
  >
    <!-- Postcard: meta + signature on the left, message on the right -->
    <template v-if="layout === 'postcard'">
      <div class="relative z-2 flex h-full w-[34%] shrink-0 flex-col justify-between border-r border-current/15 pr-4">
        <div>
          <p class="font-type text-[0.55rem] uppercase tracking-[0.18em] opacity-55">
            Signals World Tour ’26
          </p>
          <p
            class="mt-1 font-display text-sm font-medium tracking-tight sm:text-base"
            :style="{ color: theme.deep }"
          >
            {{ theme.toLine }}
          </p>
        </div>
        <div>
          <p class="font-type text-[0.5rem] uppercase tracking-[0.16em] opacity-50">
            With love from
          </p>
          <p
            class="mt-0.5 text-sm sm:text-base"
            :class="[
              fontClass,
              design.font === 'script' ? 'text-base sm:text-lg' : '',
              design.font === 'type' ? 'text-xs sm:text-sm' : '',
            ]"
          >
            {{ senderName || 'Anonymous' }}
          </p>
        </div>
      </div>

      <div class="relative z-2 h-full min-w-0 flex-1 overflow-y-auto">
        <LetterSticker
          v-for="{ sticker, index } in visibleStickers"
          :key="`${sticker.id}-${index}`"
          :sticker="sticker"
          class="letter-sticker-enter"
        />
        <div
          class="relative whitespace-pre-wrap text-pretty leading-relaxed"
          :class="bodyTypeClass"
        >
          <span>{{ visibleText }}</span><span
            v-if="typing"
            class="letter-caret"
            aria-hidden="true"
          /><span
            v-if="ghostTail"
            class="letter-type-ghost"
            aria-hidden="true"
          >{{ ghostTail }}</span>
        </div>
      </div>
    </template>

    <!-- Letter: header, then full-height body, then signature footer -->
    <template v-else>
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

      <!--
        Body area is always full-height:
        one text flow with visible typed chars + invisible remainder (ghost tail).
        Stickers use % of this stable box, so they don’t jump as typing progresses.
      -->
      <div class="relative z-2 min-h-40">
        <LetterSticker
          v-for="{ sticker, index } in visibleStickers"
          :key="`${sticker.id}-${index}`"
          :sticker="sticker"
          class="letter-sticker-enter"
        />

        <div
          class="relative whitespace-pre-wrap text-pretty leading-relaxed"
          :class="bodyTypeClass"
        >
          <span>{{ visibleText }}</span><span
            v-if="typing"
            class="letter-caret"
            aria-hidden="true"
          /><span
            v-if="ghostTail"
            class="letter-type-ghost"
            aria-hidden="true"
          >{{ ghostTail }}</span>
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
    </template>
  </article>
</template>
