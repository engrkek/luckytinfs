<script setup lang="ts">
import { LETTER_RECIPIENTS } from '#shared/letters/assets'
import { MAILBOX_PAINT, RECIPIENT_THEME } from '#shared/letters/visuals'

useSeoMeta({
  title: 'Letters',
  description: 'Open fan letters for Maloi, Jhoanna, and BINI — or write your own for Signals World Tour 2026.',
})

useHead({
  meta: [
    { key: 'theme-color', name: 'theme-color', content: '#f6f0e2' },
  ],
})

/** Looping carousel: clone last + first so swiping wraps around */
const SLIDES = [LETTER_RECIPIENTS.at(-1)!, ...LETTER_RECIPIENTS, LETTER_RECIPIENTS[0]!]
const track = useTemplateRef('track')

/** Recipient currently snapped to center — drives the background glow */
const active = ref(LETTER_RECIPIENTS[0]!.id)

onMounted(() => {
  const el = track.value
  if (!el)
    return
  const w = () => el.clientWidth
  const index = () => Math.min(SLIDES.length - 1, Math.max(0, Math.round(el.scrollLeft / w())))
  // Start on the first real slide (index 1). Retry a few frames: the
  // container may not be scrollable yet when mounted (late styles, snap pass).
  let tries = 0
  const init = () => {
    el.scrollTo({ left: w(), behavior: 'instant' })
    if (el.scrollLeft < w() / 2 && tries++ < 20)
      requestAnimationFrame(init)
  }
  init()
  const onSettle = () => {
    const i = index()
    if (i === 0)
      el.scrollTo({ left: w() * (SLIDES.length - 2), behavior: 'instant' })
    else if (i === SLIDES.length - 1)
      el.scrollTo({ left: w(), behavior: 'instant' })
  }
  el.addEventListener('scrollend', onSettle)
  // ponytail: debounced scroll fallback for browsers without scrollend
  let t: number | undefined
  el.addEventListener('scroll', () => {
    active.value = SLIDES[index()]!.id
    clearTimeout(t)
    t = window.setTimeout(onSettle, 150)
  }, { passive: true })
})
</script>

<template>
  <div
    class="letter-stage letter-stage--paper relative z-1 min-h-dvh"
    :style="{ '--glow': MAILBOX_PAINT[active].body }"
  >
    <div class="relative z-1 mx-auto max-w-lg px-5 pt-10 pb-24 sm:pt-14">
      <!-- Landing hero -->
      <header class="text-center sm:text-left">
        <p class="font-type text-[0.6rem] uppercase tracking-[0.28em] text-[#a08c60]">
          Signals World Tour 2026
        </p>
        <h1 class="mt-3 font-display text-[clamp(2rem,7vw,2.75rem)] font-medium tracking-tight text-[#2c2416] leading-[1.1] text-balance">
          Letters for Luckytin &amp; BINI
        </h1>
      </header>

      <!-- Mailboxes -->
      <section class="mt-20">
        <div ref="track" class="pt-10 mx-[calc(50%-50vw)] flex snap-x snap-mandatory items-end overflow-x-auto pb-2 scrollbar-none [&::-webkit-scrollbar]:hidden">
          <NuxtLink
            v-for="(m, i) in SLIDES"
            :key="`${m.id}-${i}`"
            :to="{ path: '/letters/write', query: { to: m.id } }"
            class="group mailbox-slide w-full shrink-0 snap-center"
            :style="{
              '--mb': MAILBOX_PAINT[m.id].body,
              '--mb-deep': MAILBOX_PAINT[m.id].deep,
              '--mb-soft': MAILBOX_PAINT[m.id].soft }"
            :aria-label="`Write a letter to ${m.label}`"
          >
            <div class="mx-auto w-[74%] max-w-90">
              <!-- Postbox body -->
              <div
                class="mt-10 rounded-t-full rounded-b-2xl bg-(--mb) px-5 pb-6 shadow-[inset_0_12px_18px_rgb(255_255_255/0.2),inset_0_-16px_26px_rgb(0_0_0/0.18),0_24px_48px_-16px_rgb(93_70_20/0.35)] transition-transform duration-300 group-hover:-translate-y-1 group-active:scale-[0.98]"
                :class="m.id === 'maloi' ? 'pt-32' : 'pt-22'"
              >
                <p class="text-center font-type text-[0.6rem] uppercase tracking-[0.32em] text-(--mb-deep)">
                  Mail
                </p>

                <!-- Slot with envelope peeking out -->
                <div class="relative mt-8 h-10 rounded-lg bg-(--mb-deep) shadow-[inset_0_3px_6px_rgb(0_0_0/0.45)]" />

                <!-- Door plate -->
                <div
                  class="relative rounded-xl border-2 border-(--mb-deep)/45 px-3"
                  :class="m.id === 'maloi' ? 'mt-10 pt-28 pb-30' : 'mt-8 pt-20 pb-22'"
                >
                  <p class="text-center font-display text-2xl font-medium text-(--mb-soft)">
                    {{ RECIPIENT_THEME[m.id].label }}
                  </p>
                  <span class="absolute bottom-3.5 left-1/2 size-2 -translate-x-1/2 rounded-full bg-(--mb-deep)" />
                </div>
              </div>
              <!-- Plinth -->
              <div class="mx-auto h-3 w-[82%] rounded-b-lg bg-(--mb-deep)/80" />
            </div>
          </NuxtLink>
        </div>
        <p class="mt-2 text-center font-type text-[0.55rem] uppercase tracking-[0.28em] text-[#a08c60]">
          ‹ Swipe for the others ›
        </p>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* Centered slide scales up, off-center slides shrink — CSS scroll-driven,
   no JS; browsers without view() support just skip the effect. */
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view(x)) {
    .mailbox-slide {
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
