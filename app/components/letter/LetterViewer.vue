<script setup lang="ts">
import type { PublicLetter } from '#shared/letters/public'
import { parseYouTubeLink } from '#shared/letters/youtube'

/**
 * Open sequence:
 * sealed → opening (flap + seal) → extracting (letter slides out of pocket)
 * → typing → reading
 *
 * Soundtrack autoplays only after the open gesture (not while sealed).
 */
type Phase = 'sealed' | 'opening' | 'extracting' | 'typing' | 'reading'

const props = defineProps<{
  letter: PublicLetter
  index?: number
  navigable?: boolean
}>()

const emit = defineEmits<{
  close: []
  next: []
  prev: []
}>()

const phase = ref<Phase>('sealed')
const { pref: globalSound, enable: enableGlobalSound, disable: disableGlobalSound } = useLetterSound()
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

function reseal() {
  clearTimers()
  phase.value = 'sealed'
  resetTyping()
  // Keep sound preference; pause is left to the player UI
}

function skipCeremony() {
  if (phase.value === 'sealed' || phase.value === 'reading')
    return
  clearTimers()
  skipTyping()
  phase.value = 'reading'
  if (hasMusic.value && globalSound.value !== 'off') {
    sound.value = 'on'
    enableGlobalSound()
  }
}

function playWithSound() {
  sound.value = 'on'
  enableGlobalSound()
}

function continueQuiet() {
  sound.value = 'off'
  disableGlobalSound()
}

const envelopeOpen = computed(() =>
  phase.value === 'opening'
  || phase.value === 'extracting'
  || phase.value === 'typing'
  || phase.value === 'reading',
)

/** Letter is physically exiting / has exited the pocket */
const envelopeExtract = computed(() =>
  phase.value === 'extracting'
  || phase.value === 'typing'
  || phase.value === 'reading',
)

const showEnvelope = computed(() =>
  phase.value === 'sealed'
  || phase.value === 'opening'
  || phase.value === 'extracting',
)

const showFullLetter = computed(() =>
  phase.value === 'typing' || phase.value === 'reading',
)

/** Compact letter visible inside/emerging from envelope */
const showPocketLetter = computed(() =>
  phase.value === 'sealed'
  || phase.value === 'opening'
  || phase.value === 'extracting',
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
    <!-- Soundtrack bar: always visible when present; autoplay only after open -->
    <div
      v-if="hasMusic"
      class="mb-6 space-y-2"
    >
      <LetterYouTubePlayer
        :music="letter.design.music"
        :autoplay="musicAutoplay"
      />
      <div class="flex items-center justify-between gap-2">
        <p
          v-if="phase === 'sealed' && sound !== 'off'"
          class="font-type text-[0.55rem] uppercase tracking-[0.16em] text-white/30"
        >
          Plays when you open the letter
        </p>
        <p
          v-else-if="phase === 'sealed' && sound === 'off'"
          class="font-type text-[0.55rem] uppercase tracking-[0.16em] text-white/30"
        >
          Sound is off
        </p>
        <span v-else />
        <button
          v-if="sound === 'on'"
          type="button"
          class="font-type text-[0.55rem] uppercase tracking-[0.16em] text-white/35 hover:text-white/60"
          @click="continueQuiet"
        >
          Mute
        </button>
        <button
          v-else
          type="button"
          class="font-type text-[0.55rem] uppercase tracking-[0.16em] text-white/45 hover:text-white/70"
          @click="playWithSound"
        >
          ♫ Sound on
        </button>
      </div>
    </div>

    <!-- Unified open scene: envelope + letter in one continuous stage -->
    <div
      class="letter-open-scene"
      :class="sceneClass"
      @click="isCeremony && phase !== 'opening' && skipCeremony()"
    >
      <!-- Envelope layer -->
      <Transition name="letter-env">
        <div
          v-if="showEnvelope"
          class="letter-open-scene__envelope"
        >
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
              v-if="showPocketLetter"
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
      </Transition>

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
