<script setup lang="ts">
const colorMode = useColorMode()
const color = computed(() => colorMode.value === 'dark' ? '#171717' : 'white')

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color },
  ],
  htmlAttrs: {
    class: 'scroll-smooth',
  },
  bodyAttrs: {
    class: 'overflow-x-hidden font-medium',
  },
  titleTemplate: '%s // LTFS Office',
})

const isDesktop = useMediaQuery('(min-width: 768px)', { ssrWidth: 767 })
</script>

<template>
  <div class="w-full h-dvh flex flex-1 overflow-y-hidden" style="--ui-radius: 0.625rem">
    <OfficeSidebar v-if="isDesktop" />

    <UTheme
      :ui="{
        table: {
          th: 'py-2',
        },
      }"
    >
      <UContainer class="flex-1 h-[calc(100dvh-77px)] lg:h-dvh overflow-x-hidden overflow-y-auto">
        <slot />
      </UContainer>
    </UTheme>

    <OfficeTabs v-if="!isDesktop" />
  </div>
</template>
