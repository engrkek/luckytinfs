<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from '@nuxt/ui'

const { user, signOut } = useUserSession()

const tabs: NavigationMenuItem[] = officeNavTabs

const userMenu: DropdownMenuItem[] = [
  {
    icon: 'ph:sign-out',
    label: 'Logout',
    color: 'error',
    onSelect: () => { signOut() },
  },
]
</script>

<template>
  <USidebar
    collapsible="icon"
    variant="floating"
    :ui="{
      container: 'h-full',
      inner: 'bg-secondary-600 text-white divide-transparent',
      body: 'py-0',
    }"
  >
    <template #header>
      <NuxtLink to="/office" class="mb-4 space-y-1 py-4">
        <NuxtImg src="/images/logos/logo-hr-white.png" />
        <p class="font-bold text-xs uppercase tracking-widest">Back Office</p>
      </NuxtLink>
    </template>

    <template #default>
      <UNavigationMenu
        :items="tabs"
        orientation="vertical"
        :ui="{
          link: 'text-white',
          linkLeadingIcon: 'text-white/80',
        }"
      />
    </template>

    <template #footer>
      <UDropdownMenu :items="userMenu">
        <UUser
          v-if="user"
          :avatar="{ src: user.image ?? '', alt: user.name }"
          :name="user.name"
          :description="user.role ?? undefined"
          :ui="{ description: 'capitalize' }"
        />
      </UDropdownMenu>
    </template>
  </USidebar>
</template>
