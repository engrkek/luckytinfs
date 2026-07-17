<script setup lang="ts">
import type { LetterDesign, LetterRecipient } from '#shared/letters/types'
import { envelopeOf, RECIPIENT_THEME } from '#shared/letters/visuals'

const props = defineProps<{
  recipient: LetterRecipient
  senderName: string
  design: LetterDesign
  open?: boolean
  index?: number
}>()

const emit = defineEmits<{
  open: []
}>()

const env = computed(() => envelopeOf(props.design.envelope))
const theme = computed(() => RECIPIENT_THEME[props.recipient])

const tilt = computed(() => {
  const i = props.index ?? 0
  const angles = [-4, 2.5, -1.5, 3.5, -3]
  return angles[i % angles.length]
})

function onActivate() {
  if (!props.open)
    emit('open')
}
</script>

<template>
  <div
    class="letter-envelope mx-auto"
    :class="open && 'is-open'"
    :style="{
      '--env-face': env.face,
      '--env-flap': env.flap,
      '--env-edge': env.edge,
      'transform': `rotate(${tilt}deg)`,
    }"
    role="button"
    :tabindex="open ? -1 : 0"
    :aria-expanded="open"
    :aria-label="open ? `Opened letter from ${senderName}` : `Open letter from ${senderName}`"
    @click="onActivate"
    @keydown.enter.prevent="onActivate"
    @keydown.space.prevent="onActivate"
  >
    <div class="letter-envelope__body">
      <div class="letter-envelope__flap" aria-hidden="true" />
      <div class="letter-envelope__pocket" aria-hidden="true" />

      <div class="letter-envelope__label px-2">
        <p class="font-type text-[0.55rem] uppercase tracking-[0.28em] text-black/40">
          Airmail · Signals World Tour
        </p>
        <p
          class="mt-2 font-display text-xl sm:text-2xl font-medium tracking-tight"
          :style="{ color: theme.deep }"
        >
          {{ theme.toLine }}
        </p>
        <p class="mt-3 font-hand text-base text-black/55">
          from {{ senderName || 'Anonymous' }}
        </p>
      </div>

      <div class="letter-envelope__seal-wrap">
        <LetterWaxSeal :seal-id="design.seal" size="md" />
      </div>

      <!-- decorative corner stamp -->
      <div
        class="absolute top-3 right-3 z-4 letter-postmark !w-12 !h-12 !text-[0.45rem]"
        :style="{ color: theme.deep }"
        aria-hidden="true"
      >
        <strong>’26</strong>
        <span>SD</span>
      </div>
    </div>
  </div>
</template>
