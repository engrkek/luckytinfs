<script setup lang="ts">
useHead({
  meta: [
    { key: 'theme-color', name: 'theme-color', content: '#0f2038' },
  ],
  htmlAttrs: {
    class: 'scroll-smooth',
  },
  bodyAttrs: {
    class: 'overflow-x-hidden bg-secondary-950 text-primary-100 selection:bg-primary-200 selection:text-secondary-950',
  },
  titleTemplate: '%s // LTFS Office',
})
</script>

<template>
  <div class="w-full h-dvh overflow-y-hidden">
    <div class="h-[calc(100dvh-72px)] overflow-x-hidden overflow-y-auto">
      <slot />
    </div>

    <OfficeTabs />
  </div>
</template>
