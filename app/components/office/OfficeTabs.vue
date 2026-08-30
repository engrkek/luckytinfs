<script setup lang="ts">
const tabs = [
  { icon: 'ph:star-four-fill', label: 'Home', to: '/office' },
  { icon: 'ph:folder', label: 'Letters', to: '/office/letters' },
]
</script>

<template>
  <div class="fixed bottom-0 inset-x-0 bg-secondary-950 text-primary-200 border-t border-secondary-900 flex items-center justify-around pt-3 pb-5">
    <NuxtLink
      v-for="(tab, index) in tabs"
      :key="index"
      :to="tab.to"
      class="flex flex-col items-center gap-1"
      active-class="text-primary-400"
    >
      <UIcon :name="tab.icon" class="text-xl" />
      <p class="text-[10px] uppercase">{{ tab.label }}</p>
    </NuxtLink>
  </div>
</template>
