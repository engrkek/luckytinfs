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
  <div class="letter-stage relative z-1 min-h-dvh">
    <div class="relative z-1 mx-auto max-w-lg px-5 pt-8 pb-20 sm:pt-10">
      <header class="mb-10 flex items-center justify-between gap-3">
        <NuxtLink
          to="/letters"
          class="font-type text-[0.62rem] uppercase tracking-[0.24em] text-white/35 hover:text-white/70 transition-colors"
        >
          ← Letters
        </NuxtLink>
        <p
          v-if="theme"
          class="font-type text-[0.55rem] uppercase tracking-[0.2em] text-white/30"
        >
          {{ theme.postmark }}
        </p>
      </header>

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
        class="rounded-xl border border-white/10 bg-white/[0.03] px-6 py-14 text-center"
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
</template>
