<script setup lang="ts">
const events = [
  {
    key: 'forgotten-island',
    status: 'Tickets on sale',
    statusClass: 'bg-primary-400 text-secondary-950',
    title: 'Forgotten Island',
    subtitle: 'Block Screening',
    when: 'Oct 3, 2026',
    where: 'SM Aura',
    body: 'A charity block screening for Lumities and Blooms, which also sends kids from Bahay Tuluyan to the movies.',
    cta: { label: 'Get your ticket', to: '/blockscreening' },
    rotate: '-rotate-1',
  },
  {
    key: 'letters-for-luckytin',
    status: 'Open now',
    statusClass: 'bg-primary-400 text-secondary-950',
    title: 'Letters for Luckytin',
    subtitle: 'Digital Fan Letters',
    when: 'Ongoing',
    where: 'Online',
    body: 'Write a digital letter for Lucky, Tintin, or BINI — sealed with a wax stamp and delivered straight to their mailbox.',
    cta: { label: 'Write a letter', to: '/letters' },
    rotate: 'rotate-2',
  },
  {
    key: 'cebu-freebies',
    status: 'Completed',
    statusClass: 'bg-secondary-100 text-secondary-800',
    title: 'Signals World Tour',
    subtitle: 'Cebu Freebies',
    when: 'Jul 11, 2026',
    where: 'Tower Garden, SM Seaside Cebu',
    body: 'Photocards, hand banners, and OT8 freebies handed out to Cebu Blooms lining up outside the arena.',
    icon: 'ph:seal-check-fill',
    iconLabel: 'All freebies distributed',
    rotate: '-rotate-1',
  },
]
</script>

<template>
  <UPageSection id="events" class="scroll-mt-10">
    <div class="space-y-10">
      <div>
        <h2 class="font-display font-medium text-3xl lg:text-5xl tracking-tight text-pretty">
          What we've been up to
        </h2>
      </div>

      <div class="grid md:grid-cols-2 gap-8">
        <div
          v-for="event in events"
          :key="event.key"
          class="bg-white text-neutral-900 drop-shadow-xl px-6 py-6"
          :class="event.rotate"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="inline-block rounded-full px-3 py-1 font-type text-[11px] uppercase tracking-wide" :class="event.statusClass">
              {{ event.status }}
            </span>
            <span class="font-type text-xs text-neutral-400">{{ event.when }}</span>
          </div>

          <h3 class="mt-4 font-display font-medium text-2xl tracking-tight">
            {{ event.title }}
          </h3>
          <p class="font-script italic text-lg text-neutral-500 -mt-1">
            {{ event.subtitle }}
          </p>

          <div class="w-full h-px border-b border-dashed border-neutral-300 my-4" />

          <p class="flex items-center gap-1.5 font-type text-xs uppercase tracking-wide text-neutral-500">
            <UIcon name="ph:map-pin" class="size-3.5" />
            {{ event.where }}
          </p>
          <p class="mt-3 text-neutral-700 text-pretty">
            {{ event.body }}
          </p>

          <UButton v-if="event.cta" :label="event.cta.label" :to="event.cta.to" class="mt-5 text-secondary-900" />
          <p v-else class="mt-5 flex items-center gap-1.5 text-sm font-medium text-secondary-700">
            <UIcon :name="event.icon" class="size-4" />
            {{ event.iconLabel }}
          </p>
        </div>
      </div>
    </div>
  </UPageSection>
</template>
