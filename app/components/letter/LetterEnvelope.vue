<script setup lang="ts">
import type { LetterDesign, LetterRecipient } from '#shared/letters/types'
import { envelopeOf, RECIPIENT_THEME } from '#shared/letters/visuals'

const props = withDefaults(defineProps<{
  recipient: LetterRecipient
  senderName: string
  design: LetterDesign
  /** Flap open + interior slides up (CodePen-style) */
  open?: boolean
  /**
   * Force seal visibility.
   * Default: visible when closed, hidden when open.
   */
  sealVisible?: boolean | null
  /** Play stamp-down animation on the seal */
  stamping?: boolean
  /** Allow tap-to-open (viewer) */
  interactive?: boolean
  index?: number
}>(), {
  open: false,
  sealVisible: null,
  stamping: false,
  interactive: true,
})

const emit = defineEmits<{
  open: []
}>()

const slots = useSlots()
const hasInterior = computed(() => Boolean(slots.default))

const env = computed(() => envelopeOf(props.design.envelope))
const theme = computed(() => RECIPIENT_THEME[props.recipient])

const tilt = computed(() => {
  const i = props.index ?? 0
  const angles = [-3, 2, -1.5, 3, -2.5]
  return angles[i % angles.length]
})

const showSeal = computed(() => {
  if (props.sealVisible != null)
    return props.sealVisible
  return !props.open
})

function onActivate() {
  if (!props.interactive || props.open)
    return
  emit('open')
}
</script>

<template>
  <div
    class="letter-envelope mx-auto"
    :class="[
      open && 'is-open',
      !interactive && 'letter-envelope--static',
      stamping && 'is-stamping',
      hasInterior && 'letter-envelope--has-interior',
    ]"
    :style="{
      '--env-face': env.face,
      '--env-flap': env.flap,
      '--env-edge': env.edge,
      '--env-tilt': `${tilt}deg`,
    }"
    :role="interactive ? 'button' : undefined"
    :tabindex="interactive && !open ? 0 : undefined"
    :aria-expanded="interactive ? open : undefined"
    :aria-label="interactive
      ? (open ? `Opened letter from ${senderName}` : `Open letter from ${senderName}`)
      : undefined"
    @click="onActivate"
    @keydown.enter.prevent="onActivate"
    @keydown.space.prevent="onActivate"
  >
    <div class="letter-envelope__shell">
      <!-- Sliding interior (letter) — rises on open, like CodePen form -->
      <div class="letter-envelope__interior">
        <slot>
          <!-- Fallback empty interior when no slot -->
          <div class="letter-envelope__interior-fill" aria-hidden="true" />
        </slot>
      </div>

      <!-- Top flap (triangle, flips open on rotateX) -->
      <div class="letter-envelope__flap" aria-hidden="true">
        <div class="letter-envelope__flap-face" />
      </div>

      <!-- Bottom pocket (V cut, sits in front) -->
      <div class="letter-envelope__pocket" aria-hidden="true">
        <div class="letter-envelope__pocket-face">
          <div class="letter-envelope__pocket-left" />
          <div class="letter-envelope__pocket-right" />
        </div>
      </div>

      <!-- Address on the pocket -->
      <div class="letter-envelope__label">
        <p
          class="font-display text-lg sm:text-xl font-medium tracking-tight leading-tight"
          :style="{ color: theme.deep }"
        >
          {{ theme.toLine }}
        </p>
        <p class="mt-1.5 font-hand text-sm sm:text-base text-black/55">
          from {{ senderName || 'Anonymous' }}
        </p>
      </div>

      <!-- Wax seal over flap/pocket join -->
      <div
        v-show="showSeal"
        class="letter-envelope__seal-wrap"
        :class="stamping && 'letter-envelope__seal-wrap--stamp'"
      >
        <LetterWaxSeal
          :seal-id="design.seal"
          size="lg"
          class="letter-envelope__seal"
        />
      </div>

      <!-- Mailed stamp -->
      <div
        class="letter-mailed-stamp"
        :style="{ color: theme.deep }"
        aria-hidden="true"
      >
        <span class="letter-mailed-stamp__ring">
          <strong>Mailed</strong>
          <span>Signals ’26</span>
        </span>
      </div>
    </div>
  </div>
</template>
