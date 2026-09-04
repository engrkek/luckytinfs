import { SITE_ACCESS_KEY } from '~/composables/useSiteAccess'

export default defineNuxtRouteMiddleware((to) => {
  const { connected, enabled } = useSiteAccess()

  if (import.meta.client && !connected.value) {
    try {
      if (localStorage.getItem(SITE_ACCESS_KEY) === 'true')
        connected.value = true
    }
    catch {}
  }

  if (!enabled.value)
    return

  if (
    to.path === '/letters'
    || to.path.startsWith('/letters/')
    || to.path === '/mailbox'
    || to.path.startsWith('/mailbox/')
    || to.path === '/blockscreening'
    || to.path.startsWith('/blockscreening/')
  ) {
    return
  }

  if (to.path === '/enter') {
    if (connected.value) {
      const redirect = to.query.redirect
      const target = typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/'
      return navigateTo(target)
    }
    return
  }

  if (!connected.value) {
    return navigateTo({
      path: '/enter',
      query: { redirect: to.fullPath },
    })
  }
})
