<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'
import { LazyLandingMenu } from '#components'

const overlay = useOverlay()
const landingMenu = overlay.create(LazyLandingMenu)

const links: ButtonProps[] = [
  { label: 'About', to: '#about' },
  { label: 'Fan Projects', to: '#fan-projects' },
  { label: 'Reports', to: '#reports' },
]
</script>

<template>
  <header class="sticky top-0 inset-x-0 z-50 bg-secondary-600 text-white">
    <UContainer class="flex items-center justify-between gap-2 py-4">
      <NuxtLink to="/">
        <NuxtImg src="/images/logos/logo-hr-white.png" class="h-5" />
      </NuxtLink>

      <div class="flex items-center gap-4">
        <div class="hidden lg:flex items-center gap-4">
          <NuxtLink v-for="(link, index) in links" :key="index" :to="link.to" class="font-extrabold uppercase hover:text-primary">
            {{ link.label }}
          </NuxtLink>
        </div>

        <UButton label="Donate" to="/donate" size="xl" class="text-secondary-900 px-4" />
        <UButton icon="tabler:menu-4" variant="ghost" class="lg:hidden" @click="landingMenu.open({ links })" />
      </div>
    </UContainer>
  </header>
</template>
