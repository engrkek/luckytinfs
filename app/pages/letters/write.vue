<script setup lang="ts">
useSeoMeta({
  title: 'Write a letter',
  description: 'Compose a digital fan letter for Maloi, Jhoanna, or BINI — Signals World Tour 2026.',
})

useHead({
  meta: [
    { key: 'theme-color', name: 'theme-color', content: '#121820' },
  ],
})
</script>

<template>
  <LetterStoryEditor />
</template>
