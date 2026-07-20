<script setup lang="ts">
import type { PublicLetter } from '#shared/letters/public'
import { LETTER_RECIPIENTS } from '#shared/letters/assets'
import { seededShuffle } from '#shared/letters/shuffle'
import { nextTourStop } from '#shared/letters/tour'
import { MAILBOX_PAINT, RECIPIENT_THEME } from '#shared/letters/visuals'

useSeoMeta({
  title: 'Letters for Luckytin & BINI',
  description: 'Open fan letters for Maloi, Jhoanna, and BINI or write your own for Signals World Tour 2026.',
})

useHead({
  meta: [
    { key: 'theme-color', name: 'theme-color', content: '#e8e2d6' },
  ],
})

/** Looping carousel: clone last + first so swiping wraps around */
const SLIDES = [LETTER_RECIPIENTS.at(-1)!, ...LETTER_RECIPIENTS, LETTER_RECIPIENTS[0]!]
const track = useTemplateRef('track')

/** Recipient currently snapped to center — drives the background glow */
const active = ref(LETTER_RECIPIENTS[0]!.id)

/**
 * On desktop the track is wider than one slide (3 peek), so "centered" isn't
 * `index * slideWidth` — the browser has to also offset by half the leftover
 * viewport width. Let scrollIntoView do that math instead of us guessing it.
 */
function closestIndex(el: HTMLElement) {
  const mid = el.scrollLeft + el.clientWidth / 2
  let best = 0
  let bestDist = Infinity
  for (let i = 0; i < el.children.length; i++) {
    const child = el.children[i] as HTMLElement
    const dist = Math.abs((child.offsetLeft + child.offsetWidth / 2) - mid)
    if (dist < bestDist) {
      bestDist = dist
      best = i
    }
  }
  return best
}

function goTo(el: HTMLElement, i: number, behavior: ScrollBehavior) {
  (el.children[i] as HTMLElement | undefined)?.scrollIntoView({ behavior, block: 'nearest', inline: 'center' })
}

onMounted(() => {
  const el = track.value
  if (!el)
    return

  // Start on the first real slide (index 1). Retry a few frames: the
  // container may not be scrollable yet when mounted (late styles, snap pass).
  let tries = 0
  const init = () => {
    goTo(el, 1, 'instant')
    if (closestIndex(el) !== 1 && tries++ < 20)
      requestAnimationFrame(init)
  }
  init()
  const onSettle = () => {
    const i = closestIndex(el)
    if (i === 0)
      goTo(el, SLIDES.length - 2, 'instant')
    else if (i === SLIDES.length - 1)
      goTo(el, 1, 'instant')
  }
  el.addEventListener('scrollend', onSettle)
  // ponytail: debounced scroll fallback for browsers without scrollend
  let t: number | undefined
  el.addEventListener('scroll', () => {
    active.value = SLIDES[closestIndex(el)]!.id
    clearTimeout(t)
    t = window.setTimeout(onSettle, 150)
  }, { passive: true })
})

/** Public letters, read-only marquee — order is stable within a tour stop, reshuffles at the next one */
const currentStop = nextTourStop()
const { data: feed } = await useFetch<{ letters: PublicLetter[] }>('/api/letters', {
  query: { limit: 30 },
})
const marqueeLetters = computed(() =>
  seededShuffle(feed.value?.letters ?? [], currentStop.id),
)

/** Letters play soundtracks — ask once so YouTube autoplay gets a real user gesture */
const { pref: soundPref, enable: enableSound, disable: disableSound } = useLetterSound()
</script>

<template>
  <div
    class="letter-stage letter-stage--paper relative z-1 min-h-dvh"
    :style="{ '--glow': MAILBOX_PAINT[active].body }"
  >
    <div class="relative z-1 mx-auto min-h-dvh max-w-lg flex flex-col px-5 pt-10 sm:pt-14">
      <!-- Landing hero -->
      <header class="shrink-0 text-center">
        <p class="font-type text-[0.6rem] uppercase tracking-[0.28em] text-[#a08c60]">
          Signals World Tour 2026
        </p>
        <h1 class="mt-3 font-display text-[clamp(2rem,7vw,2.75rem)] font-medium tracking-tight text-[#2c2416] leading-[1.1] text-balance">
          Letters for Luckytin &amp; BINI
        </h1>
      </header>

      <!-- Mailboxes: height tracks the viewport so the box stays grounded at the bottom of the screen -->
      <section class="mt-auto pt-10 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div ref="track" class="relative mx-[max(calc(50%-50vw),calc(50%-36rem))] flex snap-x snap-mandatory items-end gap-x-6 overflow-x-auto pt-2 pb-2 scrollbar-none [&::-webkit-scrollbar]:hidden">
          <NuxtLink
            v-for="(m, i) in SLIDES"
            :key="`${m.id}-${i}`"
            :to="{ path: '/letters/write', query: { to: m.id } }"
            class="group w-[min(76vw,23rem)] shrink-0 snap-center"
            :style="{
              '--mb': MAILBOX_PAINT[m.id].body,
              '--mb-deep': MAILBOX_PAINT[m.id].deep,
              '--mb-soft': MAILBOX_PAINT[m.id].soft }"
            :aria-label="`Write a letter to ${m.label}`"
          >
            <div
              class="mx-auto flex w-full max-w-90 flex-col transition-opacity duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]"
              :class="[
                m.id === 'maloi' ? 'h-[clamp(24rem,84dvh,40rem)]' : 'h-[clamp(22rem,78dvh,38rem)]',
                active === m.id ? 'opacity-100' : 'opacity-55',
              ]"
            >
              <!-- Postbox body -->
              <div
                class="flex flex-1 flex-col rounded-t-full rounded-b-2xl bg-(--mb) px-5 pb-6 shadow-[inset_0_12px_18px_rgb(255_255_255/0.2),inset_0_-16px_26px_rgb(0_0_0/0.18),0_24px_48px_-16px_rgb(93_70_20/0.35)] transition-transform duration-300 group-hover:-translate-y-1 group-active:scale-[0.98]"
                :class="m.id === 'maloi' ? 'pt-32' : 'pt-22'"
              >
                <p class="shrink-0 text-center font-type text-[0.6rem] uppercase tracking-[0.32em] text-(--mb-deep)">
                  Mail
                </p>

                <!-- Slot with envelope peeking out -->
                <div class="relative mt-8 h-10 shrink-0 rounded-lg bg-(--mb-deep) shadow-[inset_0_3px_6px_rgb(0_0_0/0.45)]" />

                <!-- Door plate -->
                <div class="relative mt-8 flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-(--mb-deep)/45 px-3">
                  <p class="text-center font-display text-2xl font-medium text-(--mb-soft)">
                    {{ RECIPIENT_THEME[m.id].label }}
                  </p>
                  <span class="absolute bottom-3.5 left-1/2 size-2 -translate-x-1/2 rounded-full bg-(--mb-deep)" />
                </div>
              </div>
              <!-- Plinth -->
              <div class="mx-auto h-3 w-[82%] shrink-0 rounded-b-lg bg-(--mb-deep)/80" />
            </div>
          </NuxtLink>
        </div>
        <p class="mt-2 text-center font-type text-[0.55rem] uppercase tracking-[0.28em] text-[#a08c60]">
          ‹ Swipe for the others ›
        </p>
      </section>
    </div>

    <div class="relative z-1 mx-auto max-w-lg px-5 pb-24">
      <!-- Read what others sent -->
      <section v-if="marqueeLetters.length" class="mt-20">
        <h2 class="text-center font-display text-xl font-medium tracking-tight text-[#2c2416] sm:text-left">
          Letters from Blooms &amp; Lumities
        </h2>
        <div class="mt-6 mx-[calc(50%-50vw)] flex snap-x snap-proximity gap-4 overflow-x-auto px-[calc(50vw-50%)] pb-2 scrollbar-none [&::-webkit-scrollbar]:hidden">
          <NuxtLink
            v-for="l in marqueeLetters"
            :key="l.id"
            :to="`/letters/${l.id}`"
            class="letter-card w-40 shrink-0 snap-center"
            :aria-label="`Read a letter for ${RECIPIENT_THEME[l.recipient].label}`"
          >
            <LetterEnvelope
              :recipient="l.recipient"
              :sender-name="l.senderName"
              :design="l.design"
              seal-size="xs"
              compact
              :open="false"
              :interactive="false"
            />
          </NuxtLink>
        </div>
        <p class="mt-2 text-center font-type text-[0.55rem] uppercase tracking-[0.28em] text-[#a08c60]">
          ‹ Swipe to read ›
        </p>
      </section>
    </div>

    <!-- Sound preference prompt -->
    <ClientOnly>
      <div
        v-if="soundPref === 'pending'"
        class="fixed inset-x-0 bottom-4 z-20 flex justify-center px-5"
      >
        <div class="flex items-center gap-2.5 rounded-full border border-[#d8cba8] bg-[#f7f2e4]/95 py-1.5 pl-4 pr-1.5 shadow-[0_12px_32px_-12px_rgb(93_70_20/0.4)] backdrop-blur-sm">
          <UIcon name="i-lucide-volume-2" class="size-3.5 shrink-0 text-[#6b5c38]" />
          <p class="font-type text-[0.55rem] uppercase tracking-[0.16em] text-[#6b5c38]">
            Sound on for the full experience
          </p>
          <button
            type="button"
            class="shrink-0 rounded-full bg-[#2c2416] px-3 py-1.5 font-type text-[0.55rem] uppercase tracking-[0.14em] text-[#f4efe4]"
            @click="enableSound"
          >
            Sound on
          </button>
          <button
            type="button"
            class="shrink-0 rounded-full px-2 py-1.5 font-type text-[0.55rem] uppercase tracking-[0.14em] text-[#6b5c38]/70"
            @click="disableSound"
          >
            Mute
          </button>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

<style scoped>
/* Centered slide scales up, off-center slides shrink — CSS scroll-driven,
   no JS; browsers without view() support just skip the effect. */
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view(x)) {
    .letter-card {
      transform-origin: bottom center;
      animation: mailbox-pop linear both;
      animation-timeline: view(x);
    }
  }
}

@keyframes mailbox-pop {
  0%, 100% {
    transform: scale(0.8);
    opacity: 0.55;
  }
  50% {
    transform: scale(1.06);
    opacity: 1;
  }
}
</style>
