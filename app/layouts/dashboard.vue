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

const isDesktop = useMediaQuery('(min-width: 768px)', { ssrWidth: 767 })
</script>

<template>
  <div class="w-full h-dvh flex flex-1 overflow-y-hidden" :style="{ '--ui-radius': '0rem' }">
    <OfficeSidebar v-if="isDesktop" />

    <div class="flex-1 h-[calc(100dvh-72px)] xl:h-dvh overflow-x-hidden overflow-y-auto">
      <slot />
    </div>

    <OfficeTabs v-if="!isDesktop" />
  </div>
</template>
