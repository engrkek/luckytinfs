import type { NavigationMenuItem } from '@nuxt/ui'

export function useOfficeNav() {
  const route = useRoute()

  const officeNavTabs = computed<NavigationMenuItem[]>(() => [
    { icon: 'ph:star-four-fill', label: 'Home', to: '/office', active: route.path.endsWith('/office') },
    { icon: 'ph:calendar-blank', label: 'Events', to: '/office/events', active: route.path.startsWith('/office/events') },
    { icon: 'ph:folder-simple', label: 'Projects', to: '/office/projects', active: route.path.startsWith('/office/projects') },
    { icon: 'ph:coins', label: 'Donations', to: '/office/donations' },
    { icon: 'ph:wallet', label: 'Wallets', to: '/office/wallets' },
    { icon: 'ph:folder', label: 'Letters', to: '/office/letters' },
  ])

  return { officeNavTabs }
}
