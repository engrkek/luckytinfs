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

/* Bottom half folds up over the top half once we leave 'ready' */
const folded = computed(() => phase.value !== 'ready')

/* Letter stands fully out of the envelope while it folds */
const extracted = computed(() =>
  phase.value === 'ready' || phase.value === 'fold',
)

/* Fold finished — swap the 3D flap for a flat back so pocket clipping works */
const tucked = computed(() => !extracted.value)

/* Flap starts closing the moment folding finishes, concurrent with the
   letter dropping into the pocket — otherwise the folded letter sits
   fully visible in the open flap gap before anything covers it. */
const envelopeOpen = computed(() =>
  phase.value === 'ready' || phase.value === 'fold',
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

  // brief beat so the open letter is visible standing out of the envelope
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
        }, 820)
      }, 780)
    }, 750)
  }, 450)
})

onBeforeUnmount(() => {
  while (timers.length)
    window.clearTimeout(timers.pop()!)
})
</script>

<template>
  <div class="letter-send-ceremony" aria-live="polite">
    <div class="letter-send-ceremony__envelope">
      <LetterEnvelope
        :recipient="recipient"
        :sender-name="senderName"
        :design="design"
        :open="envelopeOpen"
        :extract="extracted"
        :seal-visible="sealVisible"
        :stamping="stamping"
        :interactive="false"
        :index="0"
      >
        <!-- Letter rides the envelope interior; bottom half folds up first -->
        <div
          class="letter-send-ceremony__fold"
          :class="[
            folded && 'letter-send-ceremony__fold--folded',
            tucked && 'letter-send-ceremony__fold--tucked',
          ]"
        >
          <div class="letter-send-ceremony__base letter-envelope-card">
            <LetterPaper
              :recipient="recipient"
              :sender-name="senderName"
              :body="body"
              :design="design"
              compact
              :sticker-progress="1"
            />
          </div>

          <div class="letter-send-ceremony__flap letter-envelope-card">
            <LetterPaper
              :recipient="recipient"
              :sender-name="senderName"
              :body="body"
              :design="design"
              compact
              :sticker-progress="1"
            />
          </div>
        </div>
      </LetterEnvelope>
    </div>

    <p class="letter-send-ceremony__hint">
      {{ hint }}
    </p>
  </div>
</template>
