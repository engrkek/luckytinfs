<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from '@nuxt/ui'

const { user, signOut } = useUserSession()

const tabs: NavigationMenuItem[] = officeNavTabs

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
      inner: 'bg-muted/75 divide-transparent',
      body: 'py-0',
    }"
  >
    <template #header>
      <NuxtLink to="/office" class="mb-8 grid gap-1">
        <NuxtImg src="/images/logos/logo-hr.png" />
        <p class="-mt-6 font-bold text-xs uppercase tracking-widest">Back Office</p>
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
