<script setup lang="ts">
const tabs = officeNavTabs
</script>

<template>
  <div class="fixed bottom-0 inset-x-0 bg-muted">
    <UNavigationMenu
      :items="tabs"
      :ui="{
        root: 'justify-around border-t border-default pt-2 pb-5',
        item: 'py-0',
        link: 'flex-col gap-1 px-3',
        linkLeadingIcon: 'size-5',
        linkLabel: 'text-[10px]/3 font-normal',
      }"
      class="w-full"
    />
    <!-- <NuxtLink
      v-for="(tab, index) in tabs"
      :key="index"
      :to="tab.to"
      class="flex flex-col items-center gap-1"
      active-class="text-primary-400"
    >
      <UIcon :name="tab.icon" class="text-xl" />
      <p class="text-[10px] uppercase">{{ tab.label }}</p>
    </NuxtLink> -->
  </div>
</template>
