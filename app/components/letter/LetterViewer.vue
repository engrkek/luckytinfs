<script setup lang="ts">
import type { PublicLetter } from '#shared/letters/public'
import { parseYouTubeLink } from '#shared/letters/youtube'

/**
 * Open: sealed → opening (flap) → extracting (letter slides out of pocket)
 * → typing (envelope drops behind the full letter) → reading
 * Reseal: reading → tucking (letter fades back onto the extracted paper)
 * → inserting (paper slides into pocket) → closing (flap shuts) → sealed
 *
 * Soundtrack autoplays only after the open gesture (not while sealed).
 */
type Phase = 'sealed' | 'opening' | 'extracting' | 'typing' | 'reading'
  | 'tucking' | 'inserting' | 'closing'

const props = defineProps<{
  letter: PublicLetter
  index?: number
  navigable?: boolean
}>()

const emit = defineEmits<{
  close: []
  next: []
  prev: []
  /** Reseal ceremony finished — envelope is sealed again */
  resealed: []
}>()

const phase = ref<Phase>('sealed')
const { pref: globalSound, enable: enableGlobalSound } = useLetterSound()
const sound = ref<'pending' | 'on' | 'off'>('pending')

function prefersReducedMotion() {
  if (!import.meta.client)
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const hasMusic = computed(() => Boolean(parseYouTubeLink(props.letter.design.music)))

function syncSoundFromGlobal() {
  if (!hasMusic.value) {
    sound.value = 'off'
    return
  }
  if (globalSound.value === 'on')
    sound.value = 'on'
  else if (globalSound.value === 'off')
    sound.value = 'off'
  else
    sound.value = 'pending'
}

onMounted(() => {
  syncSoundFromGlobal()
})

const typingActive = computed(() => phase.value === 'typing' || phase.value === 'reading')

const {
  displayed,
  done: typingDone,
  progress: typingProgress,
  skip: skipTyping,
  reset: resetTyping,
} = useTypewriter(
  computed(() => props.letter.body),
  {
    active: typingActive,
    cps: 30,
  },
)

const stickerProgress = computed(() => {
  if (phase.value === 'reading' || typingDone.value)
    return 1
  if (phase.value !== 'typing')
    return 0
  return typingProgress.value
})

watch(typingDone, (done) => {
  if (done && phase.value === 'typing')
    phase.value = 'reading'
})

const timers: number[] = []

function later(fn: () => void, ms: number) {
  if (prefersReducedMotion()) {
    fn()
    return
  }
  timers.push(window.setTimeout(fn, ms))
}

function clearTimers() {
  while (timers.length)
    window.clearTimeout(timers.pop()!)
}

/**
 * Seal tap = open ceremony + soundtrack start (if not muted on landing).
 * User gesture unlocks YouTube autoplay.
 */
function openLetter() {
  if (phase.value !== 'sealed')
    return

  // Start music after open unless they chose quiet on the landing
  if (hasMusic.value && globalSound.value !== 'off') {
    sound.value = 'on'
    enableGlobalSound()
  }
  else if (hasMusic.value) {
    sound.value = 'off'
  }

  if (prefersReducedMotion()) {
    phase.value = 'reading'
    skipTyping()
    return
  }

  // 1) Flap flips, seal lifts, letter peeks
  phase.value = 'opening'
  later(() => {
    // 2) Letter slides fully out of the envelope
    phase.value = 'extracting'
    later(() => {
      // 3) Full letter in place, typewriter + stickers
      phase.value = 'typing'
    }, 780)
  }, 620)
}

/** Reverse ceremony: letter slides back in, flap closes */
function reseal() {
  if (phase.value !== 'reading')
    return
  clearTimers()
  // 1) Full letter fades back onto the extracted paper behind it
  phase.value = 'tucking'
  later(() => {
    // 2) Paper slides down into the pocket
    phase.value = 'inserting'
    later(() => {
      // 3) Flap closes, seal returns
      phase.value = 'closing'
      later(() => {
        phase.value = 'sealed'
        resetTyping()
        emit('resealed')
      }, 650)
    }, 750)
  }, 520)
  // Keep sound preference; pause is left to the player UI
}

const RESEAL_PHASES: Phase[] = ['tucking', 'inserting', 'closing']

function skipCeremony() {
  if (phase.value === 'sealed' || phase.value === 'reading')
    return
  clearTimers()
  if (RESEAL_PHASES.includes(phase.value)) {
    phase.value = 'sealed'
    resetTyping()
    emit('resealed')
    return
  }
  skipTyping()
  phase.value = 'reading'
  if (hasMusic.value && globalSound.value !== 'off') {
    sound.value = 'on'
    enableGlobalSound()
  }
}

/**
 * Flap is open during the hand-off phases only. Once the letter is out
 * (typing/reading) the envelope closes up behind it — no flap towering
 * over the letter — and reopens while resealing.
 */
const envelopeOpen = computed(() =>
  phase.value === 'opening'
  || phase.value === 'extracting'
  || phase.value === 'tucking'
  || phase.value === 'inserting',
)

/**
 * Paper is out of the pocket. During typing/reading the extract is released
 * so the pocket paper settles back inside, hidden behind the full letter —
 * the envelope visually "moves behind".
 */
const envelopeExtract = computed(() =>
  phase.value === 'extracting' || phase.value === 'tucking',
)

const showFullLetter = computed(() =>
  phase.value === 'typing' || phase.value === 'reading' || phase.value === 'tucking',
)

const isCeremony = computed(() =>
  phase.value !== 'sealed' && phase.value !== 'reading',
)

/** Visible typewriter text; full `letter.body` always reserved for layout height */
const revealedBody = computed(() =>
  phase.value === 'reading' || typingDone.value
    ? props.letter.body
    : displayed.value,
)

/** Autoplay only after open — never while sealed */
const musicAutoplay = computed(() =>
  sound.value === 'on' && phase.value !== 'sealed',
)

const sceneClass = computed(() => `letter-open-scene--${phase.value}`)

watch(() => props.letter.id, () => {
  clearTimers()
  phase.value = 'sealed'
  resetTyping()
  syncSoundFromGlobal()
})

watch(globalSound, () => {
  // Don't force play while sealed if they toggle from elsewhere
  if (phase.value === 'sealed') {
    syncSoundFromGlobal()
    return
  }
  syncSoundFromGlobal()
})

onBeforeUnmount(clearTimers)
</script>

<template>
  <div class="letter-viewer relative mx-auto w-full max-w-md">
    <!-- Minimal soundtrack bar, docked at the bottom of the screen -->
    <LetterYouTubePlayer
      v-if="hasMusic"
      :music="letter.design.music"
      :autoplay="musicAutoplay"
    />

    <!-- Unified open scene: envelope + letter in one continuous stage -->
    <div
      class="letter-open-scene"
      :class="sceneClass"
      @click="isCeremony && phase !== 'opening' && skipCeremony()"
    >
      <!-- Envelope layer — always mounted; drops behind the letter once open -->
      <div class="letter-open-scene__envelope">
        <LetterEnvelope
          :recipient="letter.recipient"
          :sender-name="letter.senderName"
          :design="letter.design"
          :open="envelopeOpen"
          :extract="envelopeExtract"
          :index="index"
          @open="openLetter"
        >
          <!-- Pocket letter (slides with envelope interior) -->
          <div
            class="letter-envelope-card h-full overflow-hidden bg-[#f7f2e8]"
          >
            <LetterPaper
              :recipient="letter.recipient"
              :sender-name="letter.senderName"
              :body="letter.body"
              :design="letter.design"
              compact
              :sticker-progress="0"
            />
          </div>
        </LetterEnvelope>

        <p
          v-if="phase === 'sealed'"
          class="mt-6 text-center font-type text-[0.65rem] uppercase tracking-[0.32em] text-white/40"
        >
          Tap the seal
        </p>
      </div>

      <!-- Full letter takes over after extract -->
      <Transition name="letter-full">
        <div
          v-if="showFullLetter"
          class="letter-open-scene__full"
        >
          <LetterPaper
            :recipient="letter.recipient"
            :sender-name="letter.senderName"
            :body="letter.body"
            :revealed-body="revealedBody"
            :design="letter.design"
            :typing="phase === 'typing' && !typingDone"
            :sticker-progress="stickerProgress"
          />
        </div>
      </Transition>
    </div>

    <p
      v-if="isCeremony"
      class="mt-4 text-center font-type text-[0.55rem] uppercase tracking-[0.24em] text-white/30"
    >
      Tap to skip
    </p>

    <div
      v-if="phase === 'reading'"
      class="mt-6 flex flex-wrap items-center justify-between gap-3 pt-1"
    >
      <button
        type="button"
        class="font-type text-[0.65rem] uppercase tracking-[0.2em] text-white/45 hover:text-white/80 transition-colors"
        @click="reseal"
      >
        ← Seal again
      </button>
      <div v-if="navigable !== false" class="flex gap-2">
        <button
          type="button"
          class="rounded-full border border-white/12 bg-white/4 px-4 py-2 font-type text-[0.65rem] uppercase tracking-[0.18em] text-white/70 hover:bg-white/8 transition-colors"
          @click="emit('prev')"
        >
          Prev
        </button>
        <button
          type="button"
          class="rounded-full border border-white/12 bg-white/4 px-4 py-2 font-type text-[0.65rem] uppercase tracking-[0.18em] text-white/70 hover:bg-white/8 transition-colors"
          @click="emit('next')"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>
