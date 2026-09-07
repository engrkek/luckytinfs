<script setup lang="ts">
definePageMeta({
  colorMode: 'light',
})

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: '#34558b' },
  ],
  htmlAttrs: {
    class: 'scroll-smooth',
  },
  bodyAttrs: {
    class: 'overflow-x-hidden bg-secondary-600 bg-[url("/images/textures/06.jpg")] bg-blend-screen text-white selection:bg-secondary selection:text-primary',
  },
})
</script>

<template>
  <UContainer class="max-w-md min-h-svh flex flex-col items-center justify-center gap-8">
    <NuxtImg src="/images/logos/logo-square-white.png" class="size-40" />

    <UCard>
      <slot />
    </UCard>
  </UContainer>
</template>
