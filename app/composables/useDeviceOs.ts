export type DeviceOs = 'ios' | 'android' | 'other'

const DEV_OVERRIDES = new Set<DeviceOs>(['ios', 'android', 'other'])

function detectOs(userAgent: string): DeviceOs {
  const ua = userAgent.toLowerCase()

  if (/iphone|ipad|ipod/.test(ua))
    return 'ios'

  // iPadOS 13+ may report as Macintosh on Safari.
  if (ua.includes('macintosh') && ua.includes('mobile'))
    return 'ios'

  if (import.meta.client && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    return 'ios'

  if (ua.includes('android'))
    return 'android'

  return 'other'
}

export function useDeviceOs() {
  const route = useRoute()

  const devOverride = computed<DeviceOs | null>(() => {
    if (!import.meta.dev)
      return null

    const value = route.query.os
    if (typeof value !== 'string')
      return null

    return DEV_OVERRIDES.has(value as DeviceOs) ? value as DeviceOs : null
  })

  const headers = import.meta.server ? useRequestHeaders(['user-agent']) : {}
  const userAgent = import.meta.client
    ? navigator.userAgent
    : (headers['user-agent'] ?? '')

  const detected = computed<DeviceOs>(() => detectOs(userAgent))
  const os = computed<DeviceOs>(() => devOverride.value ?? detected.value)

  return { os, devOverride, detected }
}