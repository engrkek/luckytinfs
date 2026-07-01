<script setup lang="ts">
definePageMeta({
  layout: false,
})

const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const { connected, enabled, tryConnect } = useSiteAccess()

const loading = ref(false)
const error = ref(false)

const redirectTo = computed(() => {
  const redirect = route.query.redirect
  return typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/'
})

useHead({
  title: 'Wi-Fi',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

async function onSubmit(password: string) {
  loading.value = true
  error.value = false

  await new Promise(resolve => setTimeout(resolve, 400))

  if (tryConnect(password))
    await router.replace(redirectTo.value)
  else
    error.value = true

  loading.value = false
}
</script>

<template>
  <WifiGate
    :network-name="config.public.networkName"
    :loading="loading"
    :error="error"
    @submit="onSubmit"
  />
</template>
