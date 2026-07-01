export const SITE_ACCESS_KEY = 'luckytinfs-wifi-connected'

export function useSiteAccess() {
  const config = useRuntimeConfig()
  const connected = useCookie(SITE_ACCESS_KEY, {
    default: () => false,
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
  })

  const enabled = computed(() => Boolean(config.public.sitePassword))

  function tryConnect(input: string) {
    if (!enabled.value)
      return true

    if (input === config.public.sitePassword) {
      connected.value = true
      return true
    }
    return false
  }

  function disconnect() {
    connected.value = false
  }

  return { connected, enabled, tryConnect, disconnect }
}