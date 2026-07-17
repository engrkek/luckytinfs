<script setup lang="ts">
useHead({
  meta: [
    { key: 'theme-color', name: 'theme-color', content: '#1f4072' },
  ],
  htmlAttrs: {
    class: 'scroll-smooth',
  },
  bodyAttrs: {
    class: 'overflow-x-hidden bg-secondary-950 text-primary-100 selection:bg-primary-300 selection:text-secondary-950',
  },
})
</script>

<template>
  <div class="w-full h-dvh flex flex-col">
    <div class="flex-1 overflow-x-hidden px-4 py-3">
      <slot />
    </div>

    <OfficeTabs />
  </div>
</template>
