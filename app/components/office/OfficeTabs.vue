<script setup lang="ts">
const tabs = officeNavTabs
</script>

<template>
  <div class="fixed bottom-0 inset-x-0 bg-muted border-t border-default">
    <div class="flex items-center justify-around pt-4 pb-6">
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
  </div>
</template>
