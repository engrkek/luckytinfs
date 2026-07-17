<script setup lang="ts">
import type { LetterDesign, LetterRecipient } from '#shared/letters/types'

type Phase = 'ready' | 'fold' | 'slide' | 'close' | 'stamp' | 'done'

defineProps<{
  recipient: LetterRecipient
  senderName: string
  body: string
  design: LetterDesign
}>()

const emit = defineEmits<{
  complete: []
}>()

const phase = ref<Phase>('ready')
const timers: number[] = []

function prefersReducedMotion() {
  if (!import.meta.client)
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function later(fn: () => void, ms: number) {
  if (prefersReducedMotion()) {
    fn()
    return
  }
  timers.push(window.setTimeout(fn, ms))
}

const letterClass = computed(() => {
  if (phase.value === 'ready')
    return ''
  if (phase.value === 'fold')
    return 'letter-send-ceremony__letter--fold'
  if (phase.value === 'slide')
    return 'letter-send-ceremony__letter--slide'
  return 'letter-send-ceremony__letter--gone'
})

const envelopeOpen = computed(() =>
  phase.value === 'ready'
  || phase.value === 'fold'
  || phase.value === 'slide',
)

const sealVisible = computed(() =>
  phase.value === 'stamp' || phase.value === 'done',
)

const stamping = computed(() => phase.value === 'stamp')

const hint = computed(() => {
  switch (phase.value) {
    case 'ready':
    case 'fold':
      return 'Folding…'
    case 'slide':
      return 'Sliding into the envelope…'
    case 'close':
      return 'Closing…'
    case 'stamp':
      return 'Stamping the seal…'
    default:
      return 'Sealed'
  }
})

onMounted(() => {
  if (prefersReducedMotion()) {
    phase.value = 'done'
    later(() => emit('complete'), 200)
    return
  }

  // brief beat so the open letter is visible
  later(() => {
    phase.value = 'fold'
    later(() => {
      phase.value = 'slide'
      later(() => {
        phase.value = 'close'
        later(() => {
          phase.value = 'stamp'
          later(() => {
            phase.value = 'done'
            later(() => emit('complete'), 420)
          }, 620)
        }, 720)
      }, 700)
    }, 680)
  }, 280)
})

onBeforeUnmount(() => {
  while (timers.length)
    window.clearTimeout(timers.pop()!)
})
</script>

<template>
  <div class="letter-send-ceremony" aria-live="polite">
    <div
      class="letter-send-ceremony__letter"
      :class="letterClass"
    >
      <LetterPaper
        :recipient="recipient"
        :sender-name="senderName"
        :body="body"
        :design="design"
        compact
        :sticker-progress="1"
      />
    </div>

    <div
      class="letter-send-ceremony__envelope"
      :class="phase === 'slide' && 'letter-send-ceremony__envelope--receive'"
    >
      <LetterEnvelope
        :recipient="recipient"
        :sender-name="senderName"
        :design="design"
        :open="envelopeOpen"
        :seal-visible="sealVisible"
        :stamping="stamping"
        :interactive="false"
        :index="0"
      />
    </div>

    <p class="letter-send-ceremony__hint">
      {{ hint }}
    </p>
  </div>
</template>
