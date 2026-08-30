<script setup lang="ts">
import type { PublicLetter } from '#shared/letters/public'
import type { LetterRecipient } from '#shared/letters/types'
import { isLetterRecipient } from '#shared/letters/public'
import { envelopeOf, MAILBOX_PAINT, RECIPIENT_THEME, sealSrc } from '#shared/letters/visuals'

const route = useRoute()
const recipientRaw = String(route.params.recipient || '')

if (!isLetterRecipient(recipientRaw))
  await navigateTo('/letters', { replace: true })

const recipient = recipientRaw as LetterRecipient
const theme = RECIPIENT_THEME[recipient]
const paint = MAILBOX_PAINT[recipient]

useSeoMeta({
  title: `${theme.label}’s Mailbox`,
  description: `Letters from Blooms and Lumities, waiting in ${theme.label}’s mailbox.`,
})

useHead({
  meta: [
    { key: 'theme-color', name: 'theme-color', content: '#f6f0e2' },
  ],
})

const memberKey = typeof route.query.key === 'string' ? route.query.key : undefined

const { data, status } = await useFetch<{ letters: PublicLetter[], source: string, unlocked: boolean }>('/api/letters', {
  query: { recipient, limit: 30, ...(memberKey ? { key: memberKey } : {}) },
})

// This mailbox is for the member only — no key, no page. Bounce fans to /letters
// rather than a "wrong key" message, so an unlocked mailbox never reveals it exists.
if (!data.value?.unlocked)
  await navigateTo('/letters', { replace: true })

const letters = computed(() => data.value?.letters ?? [])

const stage = ref<'mailbox' | 'drawing' | 'letter' | 'returning'>('mailbox')
const current = ref<PublicLetter | null>(null)
let lastId: string | null = null

// Read pile: letters this fan has already drawn, kept so they can reread
// without re-rolling the mailbox. Persists across visits (per recipient).
const readIds = useLocalStorage<string[]>(`mailbox-read-${recipient}`, [])
const readPile = computed(() =>
  readIds.value
    .map(id => letters.value.find(l => l.id === id))
    .filter((l): l is PublicLetter => Boolean(l)),
)

function markRead(letter: PublicLetter) {
  if (!readIds.value.includes(letter.id))
    readIds.value.push(letter.id)
}

function draw() {
  if (stage.value !== 'mailbox' || !letters.value.length)
    return
  // ponytail: random without repeat-of-last; weighted "unread" rotation if they ask
  const pool = letters.value.length > 1
    ? letters.value.filter(l => l.id !== lastId)
    : letters.value
  current.value = pool[Math.floor(Math.random() * pool.length)]!
  lastId = current.value.id
  markRead(current.value)
  stage.value = 'drawing'
  setTimeout(() => {
    stage.value = 'letter'
  }, 550)
}

/** Reopen a letter straight from the read pile — no pull-out animation */
function reread(letter: PublicLetter) {
  if (stage.value !== 'mailbox')
    return
  current.value = letter
  lastId = letter.id
  stage.value = 'letter'
}

/** Overlay closes and the envelope slips back into the slot */
function putBack() {
  if (stage.value !== 'letter')
    return
  current.value = null
  stage.value = 'returning'
  setTimeout(() => {
    stage.value = 'mailbox'
  }, 520)
}
</script>

<template>
  <div
    class="letter-stage letter-stage--paper relative z-1 min-h-dvh"
    :style="{ '--glow': paint.body }"
  >
    <div class="relative z-1 mx-auto max-w-lg px-5 pt-10 pb-24 sm:pt-14">
      <header class="text-center">
        <p class="font-type text-[0.6rem] uppercase tracking-[0.28em] text-[#a08c60]">
          Signals World Tour 2026
        </p>
        <h1 class="mt-3 font-display text-[clamp(2rem,7vw,2.75rem)] font-medium tracking-tight leading-[1.1] text-[#2c2416]">
          {{ theme.label }}’s Mailbox
        </h1>
      </header>

      <!-- Mailbox — stays put; the letter opens in an overlay above it -->
      <div class="mt-6">
        <button
          type="button"
          class="group mx-auto block w-[74%] max-w-90 transition-transform active:scale-[0.98]"
          :style="{ '--mb': paint.body, '--mb-deep': paint.deep, '--mb-soft': paint.soft }"
          :disabled="!letters.length || stage !== 'mailbox'"
          aria-label="Pull out a letter"
          @click="draw"
        >
          <!-- Postbox body — maloi's runs tallest (shortest member, tallest mailbox) -->
          <div
            class="mt-8 rounded-t-full rounded-b-2xl bg-(--mb) px-5 pb-6 shadow-[inset_0_12px_18px_rgb(255_255_255/0.2),inset_0_-16px_26px_rgb(0_0_0/0.18),0_24px_48px_-16px_rgb(93_70_20/0.35)] transition-transform duration-300 group-hover:-translate-y-1"
            :class="recipient === 'maloi' ? 'pt-32' : 'pt-22'"
          >
            <p class="text-center font-type text-[0.6rem] uppercase tracking-[0.32em] text-(--mb-deep)">
              Mail
            </p>

            <!-- Slot: envelope slides out on draw, slips back in on reseal -->
            <div class="relative mt-8 h-10 rounded-lg bg-(--mb-deep) shadow-[inset_0_3px_6px_rgb(0_0_0/0.45)]">
              <div
                v-if="stage === 'drawing' || stage === 'returning'"
                class="absolute left-1/2 top-1/2 z-10 h-14 w-20 rounded-[3px] bg-[#f7f3ec] shadow-lg"
                :class="stage === 'drawing' ? 'envelope-out' : 'envelope-in'"
              >
                <div
                  class="h-6 w-full bg-[#e7dfd0]"
                  style="clip-path: polygon(0 0, 100% 0, 50% 100%)"
                />
              </div>
            </div>

            <!-- Door plate -->
            <div
              class="relative rounded-xl border-2 border-(--mb-deep)/45 px-3"
              :class="recipient === 'maloi' ? 'mt-10 pt-28 pb-30' : 'mt-8 pt-20 pb-22'"
            >
              <p class="text-center font-display text-2xl font-medium text-(--mb-soft)">
                {{ theme.label }}
              </p>
              <span class="absolute bottom-3.5 left-1/2 size-2 -translate-x-1/2 rounded-full bg-(--mb-deep)" />
            </div>
          </div>
          <!-- Plinth -->
          <div class="mx-auto h-3 w-[82%] rounded-b-lg bg-(--mb-deep)/80" />
        </button>

        <p class="mt-6 text-center font-type text-[0.65rem] uppercase tracking-[0.28em] text-[#a08c60]">
          <template v-if="status === 'pending'">
            Checking the mail…
          </template>
          <template v-else-if="!letters.length">
            No letters yet — check back soon
          </template>
          <template v-else-if="stage === 'drawing'">
            Pulling one out…
          </template>
          <template v-else-if="stage === 'returning'">
            Back in the mailbox
          </template>
          <template v-else>
            Tap the mailbox for a letter
          </template>
        </p>
      </div>

      <!-- Read pile — letters already drawn, sitting beside the mailbox to reread -->
      <div v-if="readPile.length" class="mt-8">
        <p class="text-center font-type text-[0.55rem] uppercase tracking-[0.28em] text-[#a08c60]/70">
          Read again
        </p>
        <div class="mt-3 flex flex-wrap justify-center gap-x-1.5 gap-y-3">
          <div
            v-for="(l, i) in readPile"
            :key="l.id"
            class="shrink-0"
            :style="{ transform: `rotate(${((i % 5) - 2) * 4}deg)` }"
          >
            <button
              type="button"
              class="relative block h-11 w-16 overflow-hidden rounded-[2px] shadow-[0_2px_5px_rgb(0_0_0/0.25)] transition-transform hover:-translate-y-1 hover:scale-105 active:scale-95 disabled:pointer-events-none"
              :style="{
                background: envelopeOf(l.design.envelope).face,
                border: `1px solid ${envelopeOf(l.design.envelope).edge}`,
              }"
              :disabled="stage !== 'mailbox'"
              :aria-label="`Reread letter from ${l.senderName}`"
              @click="reread(l)"
            >
              <span
                class="absolute inset-x-0 top-0 h-1/2"
                :style="{
                  background: envelopeOf(l.design.envelope).flap,
                  clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                }"
                aria-hidden="true"
              />
              <img
                v-if="sealSrc(l.design.seal)"
                :src="sealSrc(l.design.seal)!"
                alt=""
                aria-hidden="true"
                class="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]"
              >
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Letter overlay: mailbox stays visible behind; resealing closes it -->
    <Transition name="letter-overlay">
      <div
        v-if="stage === 'letter' && current"
        class="letter-mailbox-overlay fixed inset-0 z-50 overflow-y-auto overscroll-contain"
      >
        <div class="mx-auto max-w-lg px-5 py-10 sm:py-14">
          <LetterViewer
            :letter="current"
            :navigable="false"
            @resealed="putBack"
            @close="putBack"
          />
          <div class="mt-8 pb-16 text-center">
            <button
              type="button"
              class="rounded-full border border-white/15 px-8 py-4 font-type text-sm uppercase tracking-[0.18em] text-white/55 hover:bg-white/5"
              @click="putBack"
            >
              ← Put it back in the mailbox
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.letter-mailbox-overlay {
  background-image: url('/images/letters/ot8.jpg');
  background-size: cover;
  background-position: center;
}

/* Envelope pops out of the slot on draw, slips back in on reseal */
.envelope-out {
  animation: envelope-out 550ms ease-out both;
}

.envelope-in {
  animation: envelope-out 500ms ease-in both reverse;
}

@keyframes envelope-out {
  from {
    transform: translate(-50%, -50%);
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  to {
    transform: translate(-50%, 30%) rotate(-8deg);
    opacity: 1;
  }
}

.letter-overlay-enter-active,
.letter-overlay-leave-active {
  transition: opacity 0.3s ease;
}

.letter-overlay-enter-from,
.letter-overlay-leave-to {
  opacity: 0;
}
</style>
