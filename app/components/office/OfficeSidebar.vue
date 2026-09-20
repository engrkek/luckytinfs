<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { user, signOut } = useUserSession()
const { officeNavTabs } = useOfficeNav()

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
        :items="officeNavTabs"
        orientation="vertical"
        :ui="{
          label: '',
          link: 'px-4 py-3 text-primary-400 hover:before:bg-secondary-300 data-active:before:bg-secondary data-active:rounded-full data-active:before:hover:bg-secondary-300',
          linkLeadingIcon: 'text-primary-400',
        }"
      />
    </template>

    <template #footer>
      <UDropdownMenu :items="userMenu" :content="{ align: 'center', collisionPadding: 12 }" :ui="{ content: 'w-(--reka-dropdown-menu-trigger-width) min-w-48' }">
        <UButton
          :avatar="{
            src: user?.image ?? undefined,
            alt: user?.name,
            size: 'lg',
          }"
          :label="user?.name"
          trailing-icon="i-lucide-chevrons-up-down"
          color="neutral"
          variant="ghost"
          square
          class="w-full  data-[state=open]:bg-secondary-400 overflow-hidden"
          :ui="{
            trailingIcon: 'text-primary ms-auto',
          }"
        >
          <div class="grid">
            <p class="text-primary-400">
              {{ user?.name }}
            </p>
            <p class="text-sm text-secondary-300 capitalize">
              {{ user?.role }}
            </p>
          </div>
        </UButton>
      </UDropdownMenu>
    </template>
  </USidebar>
</template>
