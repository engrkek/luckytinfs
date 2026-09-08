<script setup lang="ts">
const freebies = [
  { label: 'luckytin photocard', price: 'FREE' },
  { label: 'OT8 photocard', price: 'FREE' },
  { label: 'luckytin / OT8 hand banner', price: 'FREE' },
]
</script>

<template>
  <UPageSection id="fan-projects" class="scroll-mt-10 bg-gingham-yellow text-neutral-900">
    <div class="grid lg:grid-cols-2 gap-8">
      <div class="lg:col-span-2 space-y-2 max-w-lg w-full">
        <h2 class="font-display font-medium text-3xl lg:text-5xl tracking-tight text-pretty">
          Fan Projects
        </h2>
        <p class="text-lg text-neutral-700">
          Little ways we can show up for Maloi and Jhoanna, from fan-made freebies to bigger projects we build together.
        </p>
      </div>

      <div class="mt-10 flex flex-col lg:flex-row items-center justify-center">
        <div class="rotate-6 max-w-sm lg:w-70 aspect-square">
          <Stamp src="/images/projects/pc.jpeg" alt="photocard fan support" class="w-full h-full drop-shadow-lg" />
        </div>
        <div class="-rotate-12 max-w-sm lg:w-70 aspect-square">
          <Stamp src="/images/projects/hand-banner.jpeg" alt="handbanner fan support" class="w-full h-full drop-shadow-lg" />
        </div>
      </div>

      <div>
        <div class="relative max-w-md w-full mx-auto mt-8 xl:mt-0 bg-linear-to-br from-white to-primary-50 text-default -rotate-3 drop-shadow-lg px-6 py-8">
          <div class="absolute top-0 left-1/2 -translate-1/2 w-50 h-10 bg-secondary opacity-80 drop-shadow-md" />

          <h3 class="text-2xl font-display tracking-tighter text-balance">
            Signals World Tour / <i>Cebu Freebies</i>
          </h3>
          <p class="mt-2 text-sm font-type uppercase tracking-widest">
            SM Seaside Cebu Arena
          </p>
          <div class="w-full h-px border-b border-dashed border-neutral-700 my-4" />
          <div class="grid gap-3">
            <div v-for="(freebie, index) in freebies" :key="index" class="flex items-center gap-2">
              <p class="text-sm font-type">
                0{{ index + 1 }}
              </p>
              <p class="font-hand font-bold text-secondary-700">
                {{ freebie.label }}
              </p>
              <div class="flex-1 h-px border-b border-dotted border-secondary-900/40" />
              <p class="text-sm font-type">
                {{ freebie.price }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UPageSection>
</template>
