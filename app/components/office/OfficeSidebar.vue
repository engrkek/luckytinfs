<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from '@nuxt/ui'

const { user, signOut } = useUserSession()

const tabs: NavigationMenuItem[] = [
  { icon: 'ph:star-four-fill', label: 'Home', to: '/office' },
  { icon: 'ph:balloon', label: 'Events', to: '/office/events' },
  { icon: 'ph:folder', label: 'Letters', to: '/office/letters' },
]

const userMenu: DropdownMenuItem[] = [
  {
    icon: 'tabler:logout',
    label: 'Logout',
    color: 'error',
    onSelect: () => { signOut() },
  },
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
      <NuxtLink to="/office" class="mb-6 grid gap-1">
        <NuxtImg src="/images/logos/logo-hr-white.png" />
        <p class="-mt-6 font-mono text-sm uppercase tracking-widest">Back Office</p>
      </NuxtLink>
    </template>

    <template #default>
      <div class="grid gap-1">
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.label"
          :to="tab.to"
          class="flex items-center gap-2 border-l-4 border-transparent font-semibold text-primary-100 transition-all hover:text-primary-200 px-3.5 py-2.5"
          active-class="border-l-4 border-primary! bg-primary/10 text-primary!"
        >
          <UIcon :name="tab.icon" />
          <p>{{ tab.label }}</p>
        </NuxtLink>
      </div>
    </template>

    <template #footer>
      <UDropdownMenu :items="userMenu">
        <UUser
          v-if="user"
          :avatar="{ src: user.image ?? '', alt: user.name }"
          :name="user.name"
          :description="user.role ?? undefined"
          :ui="{
            name: 'text-primary-400',
            description: 'text-primary-200/70 capitalize',
          }"
        />
      </UDropdownMenu>
    </template>
  </USidebar>
</template>
