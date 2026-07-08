<script setup lang="ts">
const links = [
  { label: 'About', to: '#about' },
  { label: 'Fan Projects', to: '#fan-projects' },
  { label: 'Reports', to: '#reports' },
]
</script>

<template>
  <header class="sticky top-0 inset-x-0 z-50 bg-secondary-900 text-primary-100">
    <UContainer class="flex items-center justify-between gap-2 py-4">
      <NuxtLink to="/">
        <UIcon name="custom:ltcon" class="text-xl" />
      </NuxtLink>

      <div class="flex items-center gap-4">
        <NuxtLink v-for="(link, index) in links" :key="index" :to="link.to" class="text-sm font-type uppercase tracking-tight hover:text-primary-400">
          {{ link.label }}
        </NuxtLink>
      </div>
    </UContainer>
  </header>
</template>
