<script setup lang="ts">
definePageMeta({
  colorMode: 'light',
})

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: '#0a174e' },
  ],
  htmlAttrs: {
    class: 'scroll-smooth',
  },
  bodyAttrs: {
    class: 'overflow-x-hidden font-medium bg-primary text-secondary selection:bg-secondary selection:text-primary',
  },
})

useSeoMeta({
  titleTemplate: 'Luckytin Fan Support',
  description: 'A dedicated fan support team for BINI Maloi & BINI Jhoanna',
})
</script>

<template>
  <div>
    <LandingHeader />

    <section class="bg-secondary-100 text-primary">
      <UContainer class="max-w-7xl py-20">
        <h1 class="font-display font-bold text-5xl lg:text-7xl tracking-tight">
          Para kay <span class="text-secondary-600">Lucky</span> at <div class="text-primary-400">
            Tintin
          </div>
        </h1>
        <p class="text-xl">
          The official fan support team for BINI Maloi & BINI Jhoanna.
        </p>
      </UContainer>
    </section>

    <section class="bg-white text-primary">
      <UContainer class="max-w-7xl py-20">
        <h2 class="font-display font-bold text-3xl lg:text-5xl tracking-tight">
          Luckytin Fan Support
        </h2>
      </UContainer>
    </section>

    <section class="bg-primary">
      <UContainer class="max-w-7xl py-20">
        <h2 class="font-display font-bold text-3xl lg:text-5xl tracking-tight">
          What we've done so far
        </h2>
      </UContainer>
    </section>

    <section class="bg-secondary text-primary selection:bg-primary! selection:text-secondary!">
      <UContainer class="max-w-7xl py-20">
        <h2 class="font-display font-bold text-3xl lg:text-5xl tracking-tight">
          Mark your calendar
        </h2>
      </UContainer>
    </section>

    <LandingFooter />
  </div>
</template>
