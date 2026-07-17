<script setup lang="ts">
import type { LetterDesign, LetterRecipient } from '#shared/letters/types'
import { fontOf, paperOf, RECIPIENT_THEME } from '#shared/letters/visuals'

const props = defineProps<{
  recipient: LetterRecipient
  senderName: string
  body: string
  design: LetterDesign
  compact?: boolean
}>()

const paper = computed(() => paperOf(props.design.background))
const fontClass = computed(() => fontOf(props.design.font))
const theme = computed(() => RECIPIENT_THEME[props.recipient])
</script>

<template>
  <article
    class="letter-paper relative overflow-hidden rounded-sm"
    :class="[
      paper.class,
      compact ? 'p-5 sm:p-6' : 'p-6 sm:p-9',
    ]"
    :style="{ color: paper.ink }"
  >
    <div class="relative z-2 flex items-start justify-between gap-3 mb-5 sm:mb-7">
      <div>
        <p class="font-type text-[0.65rem] uppercase tracking-[0.22em] opacity-55">
          Signals World Tour ’26
        </p>
        <p class="mt-1 font-display text-lg sm:text-xl font-medium tracking-tight" :style="{ color: theme.deep }">
          {{ theme.toLine }}
        </p>
      </div>
      <!-- <div class="letter-postmark shrink-0" :style="{ color: theme.deep }">
        <strong>Tour</strong>
        <span>{{ today }}</span>
        <span class="mt-0.5">{{ theme.postmark }}</span>
      </div> -->
    </div>

    <div class="relative z-2 min-h-40">
      <LetterSticker
        v-for="(sticker, i) in design.stickers"
        :key="`${sticker.id}-${i}`"
        :sticker="sticker"
      />

      <div
        class="relative whitespace-pre-wrap text-pretty leading-relaxed"
        :class="[
          fontClass,
          design.font === 'script' ? 'text-xl sm:text-2xl leading-snug' : 'text-base sm:text-lg',
          design.font === 'type' ? 'text-[0.95rem] sm:text-base leading-[1.7]' : '',
        ]"
      >
        {{ body }}
      </div>
    </div>

    <footer class="relative z-2 mt-8 sm:mt-10 pt-4 border-t border-current/10 flex items-end justify-between gap-3">
      <div>
        <p class="font-type text-[0.6rem] uppercase tracking-[0.18em] opacity-50">
          With love from
        </p>
        <p
          class="mt-0.5 text-lg sm:text-xl"
          :class="design.font === 'type' ? 'font-type' : 'font-hand'"
        >
          {{ senderName || 'Anonymous' }}
        </p>
      </div>
      <LetterWaxSeal :seal-id="design.seal" size="sm" class="opacity-90" />
    </footer>
  </article>
</template>
