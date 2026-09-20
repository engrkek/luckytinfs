import type { NavigationMenuItem } from '@nuxt/ui'

/** Phosphor pairs an outline icon with a `-fill` variant for the active state. */
export type OfficeNavItem = NavigationMenuItem & { icon: string, activeIcon: string, to: string }

/** Bottom bar shows the first PRIMARY_TABS; the rest live behind "More". */
const PRIMARY_TABS = 4

export function useOfficeNav() {
  const route = useRoute()

  const isActive = (to: string) =>
    to === '/office' ? route.path === '/office' : route.path.startsWith(to)

  const officeNavTabs = computed<OfficeNavItem[]>(() =>
    [
      { icon: 'ph:star-four', activeIcon: 'ph:star-four-fill', label: 'Home', to: '/office' },
      { icon: 'ph:folder-simple', activeIcon: 'ph:folder-simple-fill', label: 'Projects', to: '/office/projects' },
      { icon: 'ph:coins', activeIcon: 'ph:coins-fill', label: 'Donations', to: '/office/donations' },
      { icon: 'ph:calendar-blank', activeIcon: 'ph:calendar-blank-fill', label: 'Events', to: '/office/events' },
      { icon: 'ph:envelope-simple', activeIcon: 'ph:envelope-simple-fill', label: 'Letters', to: '/office/letters' },
      { icon: 'ph:wallet', activeIcon: 'ph:wallet-fill', label: 'Wallets', to: '/office/wallets' },
    ].map(item => ({ ...item, active: isActive(item.to) })),
  )

  const officeNavPrimary = computed(() => officeNavTabs.value.slice(0, PRIMARY_TABS))
  const officeNavMore = computed(() => officeNavTabs.value.slice(PRIMARY_TABS))

  return { officeNavTabs, officeNavPrimary, officeNavMore }
}
