<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const tabs: NavigationMenuItem[] = [
  { icon: 'ph:star-four-fill', label: 'Home', to: '/office' },
  { icon: 'ph:balloon', label: 'Events', to: '/office/events' },
  { icon: 'ph:folder', label: 'Letters', to: '/office/letters' },
]
</script>

<template>
  <USidebar
    :ui="{
      container: 'h-full',
      inner: 'bg-secondary-900/25 divide-transparent',
      body: 'py-0',
    }"
  >
    <template #header>
      <NuxtLink to="/office">
        <NuxtImg src="/images/logos/logo-hr-white.png" />
      </NuxtLink>
    </template>

    <template #default>
      <UNavigationMenu
        :items="tabs"
        orientation="vertical"
        :ui="{
          link: 'px-4 py-3',
        }"
      />
    </template>
  </USidebar>
</template>
