<script setup lang="ts">
import type { PublicLetter } from '#shared/letters/public'
import { motion } from 'motion-v'
import { isLetterRecipient } from '#shared/letters/public'
import { RECIPIENT_THEME } from '#shared/letters/visuals'

const route = useRoute()
const recipientParam = computed(() => String(route.params.recipient || ''))

if (!isLetterRecipient(recipientParam.value)) {
  throw createError({ statusCode: 404, statusMessage: 'Mailbox not found' })
}

const recipient = recipientParam.value
const theme = RECIPIENT_THEME[recipient]

useSeoMeta({
  title: `${theme.label}’s mailbox`,
  description: `Today’s fan letters for ${theme.label} — Magical Mailbox, Signals World Tour 2026.`,
})

useHead({
  meta: [
    { key: 'theme-color', name: 'theme-color', content: '#1a2230' },
  ],
})

const { data, status, error, refresh } = await useFetch<{
  letters: PublicLetter[]
  source: 'featured' | 'archive' | 'demo'
}>('/api/letters', {
  query: { recipient, limit: 12 },
})

const letters = computed(() => data.value?.letters ?? [])
const source = computed(() => data.value?.source ?? 'demo')
const active = ref(0)

watch(letters, (list) => {
  if (active.value >= list.length)
    active.value = 0
})

const current = computed(() => letters.value[active.value] ?? null)

function next() {
  if (!letters.value.length)
    return
  active.value = (active.value + 1) % letters.value.length
}

function prev() {
  if (!letters.value.length)
    return
  active.value = (active.value - 1 + letters.value.length) % letters.value.length
}

const sourceLabel = computed(() => {
  if (source.value === 'featured')
    return 'Today’s curated letters'
  if (source.value === 'archive')
    return 'Featured archive'
  return 'Preview letters'
})

const todayLabel = computed(() =>
  new Intl.DateTimeFormat('en', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date()),
)
</script>

<template>
  <div class="mailbox-desk relative z-1 min-h-dvh">
    <div class="relative z-1 mx-auto max-w-lg px-5 pt-8 pb-20 sm:pt-10">
      <header class="mb-8 sm:mb-10">
        <NuxtLink
          to="/mailbox"
          class="inline-flex font-type text-[0.65rem] uppercase tracking-[0.24em] text-[#c8bfb0]/60 hover:text-[#f0e8da] transition-colors"
        >
          ← All mailboxes
        </NuxtLink>

        <motion.div
          :initial="{ opacity: 0, y: 12 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }"
        >
          <div class="mt-5 flex items-start justify-between gap-4">
            <div>
              <p class="font-type text-[0.62rem] uppercase tracking-[0.28em] text-[#c8bfb0]/55">
                {{ todayLabel }}
              </p>
              <h1 class="mt-2 font-display text-[clamp(1.75rem,6vw,2.4rem)] font-medium tracking-tight text-[#f4efe4] leading-tight">
                {{ theme.toLine }}
              </h1>
              <p class="mt-2 font-type text-[0.65rem] uppercase tracking-[0.2em] text-[#c8bfb0]/50">
                {{ sourceLabel }}
                <span v-if="letters.length" class="text-[#c8bfb0]/35"> · {{ letters.length }} today</span>
              </p>
            </div>
            <div
              class="mt-1 size-12 shrink-0 rounded-full border border-white/15"
              :class="theme.gingham"
              :aria-label="theme.label"
            />
          </div>
        </motion.div>
      </header>

      <!-- Loading -->
      <div
        v-if="status === 'pending'"
        class="flex min-h-72 flex-col items-center justify-center gap-3 text-[#c8bfb0]/60"
      >
        <div class="size-8 animate-pulse rounded-full border-2 border-[#c8bfb0]/30 border-t-[#e0c56a]" />
        <p class="font-type text-[0.65rem] uppercase tracking-[0.22em]">
          Sorting the mail…
        </p>
      </div>

      <!-- Error -->
      <div
        v-else-if="error"
        class="rounded-xl border border-red-400/20 bg-red-950/30 p-6 text-center"
      >
        <p class="font-display text-lg text-[#f4efe4]">
          Couldn’t open this mailbox
        </p>
        <p class="mt-2 text-sm text-[#c8bfb0]/70">
          {{ error.message || 'Something went wrong.' }}
        </p>
        <button
          type="button"
          class="mt-4 font-type text-[0.7rem] uppercase tracking-[0.2em] text-[#e0c56a]"
          @click="refresh()"
        >
          Try again
        </button>
      </div>

      <!-- Empty -->
      <div
        v-else-if="!letters.length"
        class="rounded-xl border border-dashed border-white/15 bg-white/3 px-6 py-14 text-center"
      >
        <p class="font-display text-xl text-[#f4efe4]">
          No letters yet today
        </p>
        <p class="mt-2 text-sm text-[#c8bfb0]/70 text-pretty">
          The mailbox is waiting. Be the first to leave a note for {{ theme.label }}.
        </p>
        <NuxtLink
          to="/letters/write"
          class="mt-6 inline-block font-type text-[0.7rem] uppercase tracking-[0.22em] text-[#e0c56a] hover:text-[#f0d878]"
        >
          Write a letter →
        </NuxtLink>
      </div>

      <!-- Viewer -->
      <template v-else-if="current">
        <!-- stack dots -->
        <div
          v-if="letters.length > 1"
          class="mb-6 flex items-center justify-center gap-2"
          role="tablist"
          aria-label="Letters"
        >
          <button
            v-for="(l, i) in letters"
            :key="l.id"
            type="button"
            role="tab"
            :aria-selected="i === active"
            :aria-label="`Letter ${i + 1} from ${l.senderName}`"
            class="h-1.5 rounded-full transition-all duration-300"
            :class="i === active
              ? 'w-6 bg-[#e0c56a]'
              : 'w-1.5 bg-white/25 hover:bg-white/40'"
            @click="active = i"
          />
        </div>

        <LetterViewer
          :key="current.id"
          :letter="current"
          :index="active"
          @next="next"
          @prev="prev"
        />

        <p class="mt-10 text-center font-type text-[0.6rem] uppercase tracking-[0.22em] text-[#c8bfb0]/35">
          Letter {{ active + 1 }} of {{ letters.length }}
        </p>
      </template>

      <div class="mt-12 flex justify-center border-t border-white/10 pt-6">
        <NuxtLink
          to="/letters/write"
          class="font-type text-[0.7rem] uppercase tracking-[0.22em] text-[#c8bfb0]/55 hover:text-[#e0c56a] transition-colors"
        >
          Leave a letter in the mailbox
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
