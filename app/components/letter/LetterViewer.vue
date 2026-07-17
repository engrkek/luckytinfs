<script setup lang="ts">
import type { PublicLetter } from '#shared/letters/public'
import { motion } from 'motion-v'
import { parseYouTubeLink } from '#shared/letters/youtube'

/**
 * Open sequence (CodePen-style envelope):
 * sealed → opening (flap flip + letter slides up) → typing → reading
 *
 * Soundtrack (YouTube) is shown and may autoplay while the envelope is still sealed.
 */
type Phase = 'sealed' | 'opening' | 'typing' | 'reading'

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

// Soundtrack ready as soon as the letter page mounts (before opening the envelope)
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
    cps: 48,
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

function openLetter() {
  if (phase.value !== 'sealed')
    return

  // Keep soundtrack going; don't re-prompt
  if (sound.value === 'pending')
    syncSoundFromGlobal()

  if (prefersReducedMotion()) {
    phase.value = 'reading'
    skipTyping()
    return
  }

  phase.value = 'opening'
  later(() => {
    phase.value = 'typing'
  }, 820)
}

function reseal() {
  clearTimers()
  phase.value = 'sealed'
  resetTyping()
  // Keep sound preference so music continues under the sealed envelope
}

function skipCeremony() {
  if (phase.value === 'sealed' || phase.value === 'reading')
    return
  clearTimers()
  skipTyping()
  phase.value = 'reading'
}

function playWithSound() {
  sound.value = 'on'
  enableGlobalSound()
}

function continueQuiet() {
  sound.value = 'off'
  disableGlobalSound()
}

const envelopeOpen = computed(() => phase.value !== 'sealed')
const showEnvelope = computed(() =>
  phase.value === 'sealed' || phase.value === 'opening',
)
const showFullLetter = computed(() =>
  phase.value === 'typing' || phase.value === 'reading',
)
const isCeremony = computed(() =>
  phase.value !== 'sealed' && phase.value !== 'reading',
)

const paperBody = computed(() =>
  phase.value === 'reading' || typingDone.value
    ? props.letter.body
    : displayed.value,
)

/** Autoplay YouTube only after sound is enabled (landing or local Play) */
const musicAutoplay = computed(() => sound.value === 'on')

watch(() => props.letter.id, () => {
  clearTimers()
  phase.value = 'sealed'
  resetTyping()
  syncSoundFromGlobal()
})

watch(globalSound, () => {
  syncSoundFromGlobal()
})

onBeforeUnmount(clearTimers)
</script>

<template>
  <div class="letter-viewer relative mx-auto w-full max-w-md">
    <!-- Soundtrack: visible & playable before the envelope opens -->
    <div
      v-if="hasMusic"
      class="mb-6 space-y-3"
    >
      <div
        v-if="sound === 'pending'"
        class="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-center"
        role="dialog"
        aria-labelledby="sound-consent-title"
      >
        <p
          id="sound-consent-title"
          class="font-display text-base text-white/90"
        >
          Soundtrack
        </p>
        <p class="mt-1 text-sm text-white/50 text-pretty">
          This letter has a song. Play it while you open the envelope?
        </p>
        <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            class="rounded-full bg-white px-5 py-2.5 font-display text-sm font-medium text-neutral-900 transition-transform active:scale-[0.98]"
            @click="playWithSound"
          >
            Play with sound
          </button>
          <button
            type="button"
            class="rounded-full border border-white/15 px-5 py-2.5 font-type text-[0.65rem] uppercase tracking-[0.16em] text-white/55 hover:bg-white/5"
            @click="continueQuiet"
          >
            Continue quietly
          </button>
        </div>
      </div>

      <template v-else>
        <LetterYouTubePlayer
          :music="letter.design.music"
          :autoplay="musicAutoplay"
        />
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
          class="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-type text-[0.65rem] uppercase tracking-[0.16em] text-white/50 hover:bg-white/[0.06]"
          @click="playWithSound"
        >
          ♫ Sound on
        </button>
      </template>
    </div>

    <!-- CodePen-style envelope -->
    <Transition name="letter-env">
      <div
        v-if="showEnvelope"
        class="relative z-10"
      >
        <LetterEnvelope
          :recipient="letter.recipient"
          :sender-name="letter.senderName"
          :design="letter.design"
          :open="envelopeOpen"
          :index="index"
          @open="openLetter"
        >
          <div class="letter-envelope-card h-full overflow-hidden bg-[#f7f2e8]">
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

    <motion.div
      v-if="showFullLetter"
      :initial="{ opacity: 0, y: 36, scale: 0.96 }"
      :animate="{ opacity: 1, y: 0, scale: 1 }"
      :transition="{ type: 'spring', stiffness: 200, damping: 24 }"
      class="relative z-20"
      @click="isCeremony && skipCeremony()"
    >
      <LetterPaper
        :recipient="letter.recipient"
        :sender-name="letter.senderName"
        :body="paperBody"
        :design="letter.design"
        :typing="phase === 'typing' && !typingDone"
        :sticker-progress="stickerProgress"
      />
    </motion.div>

    <p
      v-if="isCeremony"
      class="mt-4 text-center font-type text-[0.55rem] uppercase tracking-[0.24em] text-white/30"
    >
      Tap letter to skip
    </p>

    <div
      v-if="phase === 'reading'"
      class="mt-5 flex flex-wrap items-center justify-between gap-3 pt-1"
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
          class="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 font-type text-[0.65rem] uppercase tracking-[0.18em] text-white/70 hover:bg-white/[0.08] transition-colors"
          @click="emit('prev')"
        >
          Prev
        </button>
        <button
          type="button"
          class="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 font-type text-[0.65rem] uppercase tracking-[0.18em] text-white/70 hover:bg-white/[0.08] transition-colors"
          @click="emit('next')"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>
