<script setup lang="ts">
const freebies = [
  { label: 'luckytin photocard', price: 'FREE' },
  { label: 'OT8 photocard', price: 'FREE' },
  { label: 'luckytin / OT8 hand banner', price: 'FREE' },
]
</script>

<template>
  <UPageSection id="fan-projects" class="scroll-mt-10">
    <div class="grid xl:grid-cols-2 gap-8">
      <div>
        <h2 class="text-3xl font-display tracking-tighter">
          current fan project
        </h2>

        <div class="mt-10 flex flex-col xl:flex-row items-center justify-center">
          <Stamp src="/images/projects/HMoAYULbwAE-l9R.jpeg" alt="photocard fan support" class="rotate-6 w-40 xl:w-70" />
          <Stamp src="/images/projects/HMoAYySbkAA2kmP.jpeg" alt="handbanner fan support" class="-rotate-12 w-40 xl:w-70" />
        </div>
      </div>

      <div>
        <div class="relative max-w-md w-full mx-auto mt-8 xl:mt-0 bg-linear-to-br from-white to-primary-50 text-default -rotate-3 drop-shadow-xl px-6 py-8">
          <div class="absolute top-0 left-1/2 -translate-1/2 w-50 h-10 bg-gingham-blue opacity-80 drop-shadow" />

          <h3 class="text-2xl font-display tracking-tighter text-balance">
            Signals World Tour / <i>Cebu Freebies</i>
          </h3>
          <p class="mt-2 text-sm font-type uppercase tracking-wideest">
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
