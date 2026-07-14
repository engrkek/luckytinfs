<script setup lang="ts">
useHead({
  htmlAttrs: {
    lang: 'en',
  },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ],
  link: [
    { rel: 'icon', href: '/logo.svg' },
  ],
})

useSeoMeta({
  titleTemplate: '%s // Luckytin Fan Support',
  description: 'A dedicated fan support team for BINI Maloi & BINI Jhoanna',
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
