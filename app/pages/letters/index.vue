<script setup lang="ts">
import type { PublicLetter } from '#shared/letters/public'
import type { LetterRecipient } from '#shared/letters/types'
import { motion } from 'motion-v'
import { LETTER_RECIPIENTS } from '#shared/letters/assets'
import { isLetterRecipient } from '#shared/letters/public'
import { RECIPIENT_THEME } from '#shared/letters/visuals'
import { parseYouTubeLink } from '#shared/letters/youtube'

useSeoMeta({
  title: 'Letters',
  description: 'Open fan letters for Maloi, Jhoanna, and BINI — or write your own for Signals World Tour 2026.',
})

useHead({
  meta: [
    { key: 'theme-color', name: 'theme-color', content: '#0c0e12' },
  ],
})

const route = useRoute()
const router = useRouter()
const { pref, ready, enable, disable } = useLetterSound()

const toParam = computed(() => {
  const raw = String(route.query.to || '')
  return isLetterRecipient(raw) ? raw : null
})

const { data, status, error, refresh } = await useFetch<{
  letters: PublicLetter[]
  source: string
}>('/api/letters', {
  query: computed(() => ({
    ...(toParam.value ? { recipient: toParam.value } : {}),
    limit: 24,
  })),
})

const letters = computed(() => data.value?.letters ?? [])

/** Ambient track from first letter that has one (for landing autoplay after consent) */
const ambientMusic = computed(() => {
  for (const letter of letters.value) {
    if (parseYouTubeLink(letter.design.music))
      return letter.design.music
  }
  // Fallback so the gate still unlocks a real soundtrack
  return 'https://www.youtube.com/watch?v=UOI37qO1Nzc'
})

const showAmbient = computed(() => ready.value && pref.value === 'on')

function setFilter(id: LetterRecipient | null) {
  router.replace({
    path: '/letters',
    query: id ? { to: id } : {},
  })
}

function preview(body: string) {
  const flat = body.replace(/\s+/g, ' ').trim()
  return flat.length > 96 ? `${flat.slice(0, 96)}…` : flat
}

function onPlayWithSound() {
  enable()
}

function onContinueQuiet() {
  disable()
}
</script>

<template>
  <div class="letter-stage relative z-1 min-h-dvh">
    <div class="relative z-1 mx-auto max-w-lg px-5 pt-10 pb-24 sm:pt-14">
      <!-- Landing hero -->
      <header class="text-center sm:text-left">
        <p class="font-type text-[0.6rem] uppercase tracking-[0.28em] text-white/35">
          Signals World Tour ’26
        </p>
        <h1 class="mt-3 font-display text-[clamp(2rem,7vw,2.75rem)] font-medium tracking-tight text-white/95 leading-[1.1] text-balance">
          Letters for Maloi, Jhoanna &amp; BINI
        </h1>
        <p class="mt-4 max-w-md mx-auto sm:mx-0 text-white/50 text-pretty leading-relaxed">
          Open sealed notes from Blooms and Lumities — or write one of your own. Paper, wax, stickers, and a little soundtrack for the road.
        </p>
      </header>

      <!-- Sound gate — first thing on the letters experience -->
      <motion.div
        v-if="!ready"
        :initial="{ opacity: 0, y: 16 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }"
        class="mt-10 rounded-2xl border border-white/10 bg-white/4 px-5 py-6 text-center"
        role="dialog"
        aria-labelledby="letters-sound-title"
      >
        <p
          id="letters-sound-title"
          class="font-display text-xl text-white/95"
        >
          Soundtrack
        </p>
        <p class="mt-2 text-sm text-white/50 text-pretty leading-relaxed">
          Some letters come with a song. Play sound while you browse and open them? Your browser needs a tap to allow audio.
        </p>
        <div class="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            class="rounded-full bg-white px-6 py-3 font-display text-sm font-medium text-neutral-900 transition-transform active:scale-[0.98]"
            @click="onPlayWithSound"
          >
            Play with sound
          </button>
          <button
            type="button"
            class="rounded-full border border-white/15 px-6 py-3 font-type text-[0.65rem] uppercase tracking-[0.16em] text-white/55 hover:bg-white/5"
            @click="onContinueQuiet"
          >
            Enter quietly
          </button>
        </div>
      </motion.div>

      <!-- After sound choice: actions + feed -->
      <template v-else>
        <div
          v-if="showAmbient"
          class="mt-8"
        >
          <p class="mb-2 font-type text-[0.55rem] uppercase tracking-[0.2em] text-white/30">
            Playing while you browse
          </p>
          <LetterYouTubePlayer
            :music="ambientMusic"
            autoplay
          />
          <button
            type="button"
            class="mt-2 font-type text-[0.55rem] uppercase tracking-[0.16em] text-white/35 hover:text-white/60"
            @click="disable"
          >
            Mute
          </button>
        </div>
        <button
          v-else
          type="button"
          class="mt-8 w-full rounded-xl border border-white/10 bg-white/3 px-4 py-3 font-type text-[0.65rem] uppercase tracking-[0.16em] text-white/50 hover:bg-white/6"
          @click="enable"
        >
          ♫ Turn sound on
        </button>

        <div class="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <NuxtLink
            to="/letters/write"
            class="rounded-2xl border border-white/12 bg-white px-5 py-4 text-center transition-transform active:scale-[0.99]"
          >
            <span class="block font-display text-lg font-medium text-neutral-900">
              Write a letter
            </span>
            <span class="mt-1 block text-sm text-neutral-600">
              Seal it with paper, wax &amp; stickers
            </span>
          </NuxtLink>
          <a
            href="#inbox"
            class="rounded-2xl border border-white/12 bg-white/4 px-5 py-4 text-center transition-colors hover:bg-white/[0.07]"
          >
            <span class="block font-display text-lg font-medium text-white/90">
              Open letters
            </span>
            <span class="mt-1 block text-sm text-white/45">
              {{ letters.length ? `${letters.length} to read` : 'Browse the desk' }}
            </span>
          </a>
        </div>

        <!-- Inbox -->
        <section
          id="inbox"
          class="mt-14 scroll-mt-8"
        >
          <div class="flex items-end justify-between gap-3">
            <div>
              <p class="font-type text-[0.55rem] uppercase tracking-[0.22em] text-white/30">
                Inbox
              </p>
              <h2 class="mt-1 font-display text-2xl font-medium text-white/90">
                Today’s letters
              </h2>
            </div>
          </div>

          <div class="mt-5 flex flex-wrap gap-1.5">
            <button
              type="button"
              class="rounded-full border px-3 py-1 font-type text-[0.6rem] uppercase tracking-[0.14em] transition-colors"
              :class="!toParam
                ? 'border-white/40 bg-white/10 text-white'
                : 'border-white/10 text-white/45 hover:border-white/25 hover:text-white/70'"
              @click="setFilter(null)"
            >
              All
            </button>
            <button
              v-for="r in LETTER_RECIPIENTS"
              :key="r.id"
              type="button"
              class="rounded-full border px-3 py-1 font-type text-[0.6rem] uppercase tracking-[0.14em] transition-colors"
              :class="toParam === r.id
                ? 'border-white/40 bg-white/10 text-white'
                : 'border-white/10 text-white/45 hover:border-white/25 hover:text-white/70'"
              @click="setFilter(r.id)"
            >
              {{ r.label }}
            </button>
          </div>

          <div
            v-if="status === 'pending'"
            class="mt-12 flex flex-col items-center gap-3 text-white/40"
          >
            <div class="size-7 animate-pulse rounded-full border-2 border-white/15 border-t-white/50" />
            <p class="font-type text-[0.6rem] uppercase tracking-[0.2em]">
              Loading…
            </p>
          </div>

          <div
            v-else-if="error"
            class="mt-10 rounded-xl border border-red-400/20 bg-red-950/20 p-6 text-center"
          >
            <p class="text-sm text-white/70">
              {{ error.message || 'Could not load letters.' }}
            </p>
            <button
              type="button"
              class="mt-3 font-type text-[0.65rem] uppercase tracking-[0.18em] text-white/50 hover:text-white/80"
              @click="refresh()"
            >
              Retry
            </button>
          </div>

          <div
            v-else-if="!letters.length"
            class="mt-12 text-center"
          >
            <p class="font-display text-xl text-white/85">
              No letters yet
            </p>
            <p class="mt-2 text-sm text-white/40">
              Be the first.
            </p>
            <NuxtLink
              to="/letters/write"
              class="mt-6 inline-block font-type text-[0.65rem] uppercase tracking-[0.2em] text-white/55 hover:text-white"
            >
              Write a letter →
            </NuxtLink>
          </div>

          <ul
            v-else
            class="mt-8 space-y-2"
          >
            <li
              v-for="(letter, i) in letters"
              :key="letter.id"
            >
              <motion.div
                :initial="{ opacity: 0, y: 10 }"
                :animate="{ opacity: 1, y: 0 }"
                :transition="{ delay: Math.min(i * 0.04, 0.32), duration: 0.4 }"
              >
                <NuxtLink
                  :to="`/letters/${letter.id}`"
                  class="group flex items-stretch gap-3 rounded-xl border border-white/[0.07] bg-white/3 px-4 py-3.5 transition-colors hover:border-white/15 hover:bg-white/5.5"
                >
                  <div
                    class="mt-0.5 size-9 shrink-0 rounded-full border border-white/10"
                    :class="RECIPIENT_THEME[letter.recipient].gingham"
                    :aria-label="RECIPIENT_THEME[letter.recipient].label"
                  />
                  <div class="min-w-0 flex-1">
                    <div class="flex items-baseline justify-between gap-2">
                      <p class="truncate font-display text-[0.95rem] text-white/90">
                        {{ letter.senderName || 'Anonymous' }}
                      </p>
                      <span class="shrink-0 font-type text-[0.55rem] uppercase tracking-[0.14em] text-white/30">
                        {{ RECIPIENT_THEME[letter.recipient].label }}
                        <span v-if="letter.design.music" class="text-white/45"> · ♫</span>
                      </span>
                    </div>
                    <p class="mt-1 line-clamp-2 text-sm leading-snug text-white/40 group-hover:text-white/50">
                      {{ preview(letter.body) }}
                    </p>
                  </div>
                  <span class="self-center font-type text-[0.6rem] text-white/25 transition-transform group-hover:translate-x-0.5 group-hover:text-white/45">
                    →
                  </span>
                </NuxtLink>
              </motion.div>
            </li>
          </ul>
        </section>
      </template>
    </div>
  </div>
</template>
