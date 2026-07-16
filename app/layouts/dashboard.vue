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

const tabs = [
  { icon: 'ph:star-four-fill', label: 'Home', to: '/office' },
  { icon: 'ph:folder', label: 'Projects', to: '/office/projects' },
  { icon: 'ph:heart', label: 'Donations', to: '/office/donations' },
  { icon: 'ph:receipt', label: 'Expenses', to: '/office/expenses' },
]
</script>

<template>
  <div class="w-full h-dvh flex flex-col">
    <div class="flex-1 overflow-x-hidden px-4 py-3">
      <slot />
    </div>

    <div class="bg-secondary-950 text-primary-100 border-t border-secondary-900 flex items-center justify-around px-4 pt-3 pb-4">
      <NuxtLink
        v-for="(tab, index) in tabs"
        :key="index"
        :to="tab.to"
        class="flex flex-col items-center gap-0.5"
        active-class="text-primary-300"
      >
        <UIcon :name="tab.icon" />
        <p class="text-xs">{{ tab.label }}</p>
      </NuxtLink>
    </div>
  </div>
</template>
