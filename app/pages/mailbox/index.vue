<script setup lang="ts">
import type { LetterRecipient } from '#shared/letters/types'
import { motion } from 'motion-v'
import { LETTER_RECIPIENTS } from '#shared/letters/assets'
import { RECIPIENT_THEME } from '#shared/letters/visuals'

useSeoMeta({
  title: 'Magical Mailboxes',
  description: 'Open today’s fan letters for Maloi, Jhoanna, and BINI — Signals World Tour 2026.',
})

useHead({
  meta: [
    { key: 'theme-color', name: 'theme-color', content: '#1a2230' },
  ],
})

const boxes = LETTER_RECIPIENTS.map((r) => {
  const theme = RECIPIENT_THEME[r.id as LetterRecipient]
  return { ...r, theme }
})
</script>

<template>
  <div class="mailbox-desk relative z-1 min-h-dvh">
    <div class="relative z-1 mx-auto max-w-lg px-5 pt-10 pb-16 sm:pt-14">
      <motion.div
        :initial="{ opacity: 0, y: 16 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }"
      >
        <p class="font-type text-[0.65rem] uppercase tracking-[0.32em] text-[#c8bfb0]/65">
          Luckytin Fan Support
        </p>
        <h1 class="mt-3 font-display text-[clamp(1.85rem,6vw,2.6rem)] font-medium tracking-tight text-[#f4efe4] text-balance leading-[1.15]">
          Magical Mailboxes
        </h1>
        <p class="mt-3 max-w-md text-[#c8bfb0]/85 text-pretty leading-relaxed">
          A traveling desk of letters from Lumities and Blooms. Choose a mailbox — open today’s curated notes, one seal at a time.
        </p>
      </motion.div>

      <ul class="mt-10 space-y-4">
        <li
          v-for="(box, i) in boxes"
          :key="box.id"
        >
          <motion.div
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.08 * (i + 1), duration: 0.5, ease: [0.22, 1, 0.36, 1] }"
          >
            <NuxtLink
              :to="`/mailbox/${box.id}`"
              class="group relative block overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm transition-colors hover:bg-white/[0.07] hover:border-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
            >
              <div
                class="absolute -right-6 -top-6 size-28 rounded-full opacity-40 blur-2xl transition-opacity group-hover:opacity-70"
                :style="{ background: box.theme.accent }"
                aria-hidden="true"
              />
              <div class="relative flex items-center gap-4">
                <div
                  class="grid size-14 shrink-0 place-items-center rounded-full border border-white/15 shadow-inner"
                  :class="box.theme.gingham"
                >
                  <span class="font-display text-lg font-medium" :style="{ color: box.theme.deep }">
                    {{ box.label.charAt(0) }}
                  </span>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="font-display text-xl tracking-tight text-[#f4efe4]">
                    {{ box.theme.toLine }}
                  </p>
                  <p class="mt-0.5 font-type text-[0.62rem] uppercase tracking-[0.2em] text-[#c8bfb0]/60">
                    {{ box.theme.postmark }}
                  </p>
                </div>
                <span class="font-type text-[0.65rem] uppercase tracking-[0.18em] text-[#c8bfb0]/55 transition-transform group-hover:translate-x-0.5">
                  Open →
                </span>
              </div>
            </NuxtLink>
          </motion.div>
        </li>
      </ul>

      <div class="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
        <NuxtLink
          to="/letters/write"
          class="font-type text-[0.7rem] uppercase tracking-[0.22em] text-[#e0c56a]/90 hover:text-[#f0d878] transition-colors"
        >
          Write a letter
        </NuxtLink>
        <p class="font-type text-[0.6rem] uppercase tracking-[0.18em] text-[#c8bfb0]/40">
          Signals World Tour 2026
        </p>
      </div>
    </div>
  </div>
</template>
