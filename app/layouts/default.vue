<script setup lang="ts">
import { MotionConfig } from 'motion-v'

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
    class: 'overflow-x-hidden bg-secondary-600 text-white selection:bg-secondary selection:text-primary',
  },
})
</script>

<template>
  <UTheme
    :ui="{
      button: {
        base: 'rounded-full',
      },
      container: {
        base: 'max-w-7xl',
      },
    }"
  >
    <MotionConfig reduced-motion="user">
      <div>
        <LandingHeader />
        <slot />
        <LandingFooter />
      </div>
    </MotionConfig>
  </UTheme>
</template>
