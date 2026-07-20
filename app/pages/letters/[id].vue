<script setup lang="ts">
import type { PublicLetter } from '#shared/letters/public'
import { motion } from 'motion-v'
import { RECIPIENT_THEME } from '#shared/letters/visuals'

const route = useRoute()
const id = computed(() => String(route.params.id || ''))

const { data, status, error, refresh } = await useFetch<{
  letter: PublicLetter
  source: string
}>(() => `/api/letters/${id.value}`)

const letter = computed(() => data.value?.letter ?? null)

const theme = computed(() =>
  letter.value ? RECIPIENT_THEME[letter.value.recipient] : null,
)

useSeoMeta({
  title: computed(() =>
    letter.value
      ? `Letter from ${letter.value.senderName || 'Anonymous'}`
      : 'Letter',
  ),
  description: computed(() =>
    letter.value
      ? `A letter for ${theme.value?.label ?? 'BINI'} — Signals World Tour 2026.`
      : 'Open a fan letter.',
  ),
})

useHead({
  meta: [
    { key: 'theme-color', name: 'theme-color', content: '#0c0e12' },
  ],
})
</script>

<template>
  <div class="letter-stage letter-stage--photo relative z-1 flex h-dvh flex-col overflow-hidden">
    <div class="relative z-2 mx-auto w-full max-w-lg px-5 py-4">
      <header class="flex items-center justify-between gap-3 rounded-full border border-white/10 bg-black/70 px-4 py-2.5 backdrop-blur-sm">
        <NuxtLink
          to="/letters"
          class="font-type text-xs uppercase tracking-[0.24em] text-white/70 hover:text-white transition-colors"
        >
          ← Letters
        </NuxtLink>
        <p
          v-if="theme"
          class="font-type text-xs uppercase tracking-[0.2em] text-white/70"
        >
          {{ theme.postmark }}
        </p>
      </header>
    </div>

    <!-- Scrollable so a long letter never grows the page — the background photo stays framed to the viewport -->
    <div class="relative z-1 min-h-0 flex-1 overflow-y-auto">
      <div class="mx-auto flex min-h-full w-full max-w-lg flex-col justify-center px-5 py-8">
        <div
          v-if="status === 'pending'"
          class="flex min-h-80 flex-col items-center justify-center gap-3 text-white/40"
        >
          <div class="size-8 animate-pulse rounded-full border-2 border-white/15 border-t-white/50" />
          <p class="font-type text-[0.6rem] uppercase tracking-[0.22em]">
            Finding the letter…
          </p>
        </div>

        <div
          v-else-if="error || !letter"
          class="rounded-xl border border-white/10 bg-black/70 px-6 py-14 text-center backdrop-blur-sm"
        >
          <p class="font-display text-xl text-white/90">
            Letter not found
          </p>
          <p class="mt-2 text-sm text-white/45">
            It may still be under review, or the link is wrong.
          </p>
          <button
            v-if="error"
            type="button"
            class="mt-4 font-type text-[0.65rem] uppercase tracking-[0.18em] text-white/50"
            @click="refresh()"
          >
            Retry
          </button>
          <NuxtLink
            to="/letters"
            class="mt-6 block font-type text-[0.65rem] uppercase tracking-[0.2em] text-white/55 hover:text-white"
          >
            Back to letters
          </NuxtLink>
        </div>

        <motion.div
          v-else
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :transition="{ duration: 0.45 }"
        >
          <LetterViewer
            :key="letter.id"
            :letter="letter"
            :navigable="false"
          />
        </motion.div>
      </div>
    </div>
  </div>
</template>
