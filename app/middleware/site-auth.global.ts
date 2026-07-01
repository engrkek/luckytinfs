export default defineNuxtRouteMiddleware((to) => {
  if (to.path === '/enter')
    return

  // localStorage is only available on the client
  if (import.meta.server)
    return

  const { connected, enabled } = useSiteAccess()

  if (!enabled.value || connected.value)
    return

  return navigateTo({
    path: '/enter',
    query: { redirect: to.fullPath },
  })
})