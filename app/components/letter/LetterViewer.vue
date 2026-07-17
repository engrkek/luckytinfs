<script setup lang="ts">
import type { PublicLetter } from '#shared/letters/public'
import { motion } from 'motion-v'
import { parseSpotifyLink } from '#shared/letters/spotify'

const props = defineProps<{
  letter: PublicLetter
  index?: number
}>()

const emit = defineEmits<{
  close: []
  next: []
  prev: []
}>()

const phase = ref<'sealed' | 'opening' | 'reading'>('sealed')

/** Sound preference for this letter open: pending until they choose */
const sound = ref<'pending' | 'on' | 'off'>('pending')

const hasMusic = computed(() => Boolean(parseSpotifyLink(props.letter.design.music)))

function openLetter() {
  if (phase.value !== 'sealed')
    return
  phase.value = 'opening'
  // Reset sound gate each open
  sound.value = hasMusic.value ? 'pending' : 'off'
  window.setTimeout(() => {
    phase.value = 'reading'
  }, 650)
}

function reseal() {
  phase.value = 'sealed'
  sound.value = 'pending'
}

/** Explicit consent = user gesture → safe to autoplay full Spotify track */
function playWithSound() {
  sound.value = 'on'
}

function continueQuiet() {
  sound.value = 'off'
}

watch(() => props.letter.id, () => {
  phase.value = 'sealed'
  sound.value = 'pending'
})
</script>

<template>
  <div class="relative w-full max-w-lg mx-auto">
    <!-- Sealed / opening envelope -->
    <motion.div
      v-show="phase !== 'reading'"
      :initial="{ opacity: 0, y: 24, scale: 0.96 }"
      :animate="{ opacity: 1, y: 0, scale: 1 }"
      :transition="{ type: 'spring', stiffness: 260, damping: 28 }"
      class="relative"
    >
      <LetterEnvelope
        :recipient="letter.recipient"
        :sender-name="letter.senderName"
        :design="letter.design"
        :open="phase !== 'sealed'"
        :index="index"
        @open="openLetter"
      />
      <p
        v-if="phase === 'sealed'"
        class="mt-5 text-center font-type text-[0.7rem] uppercase tracking-[0.28em] text-[#c8bfb0]/70"
      >
        Tap the seal to open
      </p>
    </motion.div>

    <!-- Reading mode -->
    <motion.div
      v-if="phase === 'reading'"
      :initial="{ opacity: 0, y: 40, rotate: -1.5 }"
      :animate="{ opacity: 1, y: 0, rotate: 0 }"
      :transition="{ type: 'spring', stiffness: 200, damping: 24 }"
    >
      <LetterPaper
        :recipient="letter.recipient"
        :sender-name="letter.senderName"
        :body="letter.body"
        :design="letter.design"
      />

      <!-- Soundtrack gate + full Spotify player -->
      <div v-if="hasMusic" class="mt-4 space-y-3">
        <!-- Consent: required so autoplay is allowed after a real click -->
        <div
          v-if="sound === 'pending'"
          class="rounded-xl border border-[#e0c56a]/35 bg-[#e0c56a]/10 px-4 py-4 text-center"
          role="dialog"
          aria-labelledby="sound-consent-title"
        >
          <p
            id="sound-consent-title"
            class="font-display text-base text-[#f4efe4]"
          >
            This letter has a soundtrack
          </p>
          <p class="mt-1 text-sm text-[#c8bfb0]/75 text-pretty">
            Play the full song while you read? Your browser needs a tap to start sound.
          </p>
          <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              class="rounded-full bg-[#e0c56a] px-5 py-2.5 font-display text-sm font-medium text-[#1a2230] transition-transform active:scale-[0.98]"
              @click="playWithSound"
            >
              Play with sound
            </button>
            <button
              type="button"
              class="rounded-full border border-white/15 px-5 py-2.5 font-type text-[0.65rem] uppercase tracking-[0.16em] text-[#c8bfb0]/80 hover:bg-white/5"
              @click="continueQuiet"
            >
              Read without sound
            </button>
          </div>
        </div>

        <!-- Full track embed — only after they agree (gesture unlocks autoplay) -->
        <template v-else-if="sound === 'on'">
          <p class="font-type text-[0.6rem] uppercase tracking-[0.2em] text-[#c8bfb0]/50">
            Playing while you read
          </p>
          <LetterSpotifyPlayer
            :music="letter.design.music"
            autoplay
          />
          <button
            type="button"
            class="font-type text-[0.55rem] uppercase tracking-[0.16em] text-[#c8bfb0]/45 hover:text-[#c8bfb0]/80"
            @click="continueQuiet"
          >
            Mute soundtrack
          </button>
        </template>

        <button
          v-else
          type="button"
          class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-type text-[0.65rem] uppercase tracking-[0.16em] text-[#c8bfb0]/70 hover:bg-white/8 hover:text-[#e0c56a]"
          @click="playWithSound"
        >
          ♫ Turn sound on
        </button>
      </div>

      <div class="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          class="font-type text-[0.7rem] uppercase tracking-[0.2em] text-[#c8bfb0]/80 hover:text-[#f0e8da] transition-colors"
          @click="reseal"
        >
          ← Fold again
        </button>
        <div class="flex gap-2">
          <button
            type="button"
            class="rounded-full border border-white/15 bg-white/5 px-4 py-2 font-type text-[0.65rem] uppercase tracking-[0.18em] text-[#e8e2d6]/90 hover:bg-white/10 transition-colors"
            @click="emit('prev')"
          >
            Prev
          </button>
          <button
            type="button"
            class="rounded-full border border-white/15 bg-white/5 px-4 py-2 font-type text-[0.65rem] uppercase tracking-[0.18em] text-[#e8e2d6]/90 hover:bg-white/10 transition-colors"
            @click="emit('next')"
          >
            Next
          </button>
        </div>
      </div>
    </motion.div>
  </div>
</template>
