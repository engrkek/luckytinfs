<script setup lang="ts">
import type { LetterDesign, LetterRecipient } from '#shared/letters/types'
import { envelopeOf, RECIPIENT_THEME } from '#shared/letters/visuals'

const props = withDefaults(defineProps<{
  recipient: LetterRecipient
  senderName: string
  design: LetterDesign
  /** Flap open + interior peeks up */
  open?: boolean
  /** Letter pulls fully out of the pocket */
  extract?: boolean
  /**
   * Force seal visibility.
   * Default: visible when closed, hidden when open.
   */
  sealVisible?: boolean | null
  stamping?: boolean
  interactive?: boolean
  index?: number
}>(), {
  open: false,
  extract: false,
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
  const angles = [-2.5, 1.5, -1, 2, -1.5]
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
      extract && 'is-extract',
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
      <!-- Letter slides up from under the front folds -->
      <div class="letter-envelope__interior">
        <slot>
          <div class="letter-envelope__interior-fill" aria-hidden="true" />
        </slot>
      </div>

      <!-- Body fill (rectangle paper) -->
      <div class="letter-envelope__body" aria-hidden="true" />

      <!-- Side folds (front of pocket) -->
      <div class="letter-envelope__fold letter-envelope__fold--left" aria-hidden="true" />
      <div class="letter-envelope__fold letter-envelope__fold--right" aria-hidden="true" />
      <div class="letter-envelope__fold letter-envelope__fold--bottom" aria-hidden="true" />

      <!-- Top flap (triangle, flips open) -->
      <div class="letter-envelope__flap" aria-hidden="true">
        <div class="letter-envelope__flap-face" />
      </div>

      <!-- Address -->
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

      <!-- Wax seal at flap tip -->
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

      <!-- Mailed stamp on flap -->
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
