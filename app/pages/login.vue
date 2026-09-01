<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'

definePageMeta({
  colorMode: 'light',
})

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: '#0a174e' },
  ],
  bodyAttrs: {
    class: 'overflow-x-hidden font-medium bg-primary text-secondary selection:bg-secondary selection:text-primary',
  },
})

useSeoMeta({
  title: 'Login',
  description: 'Login to your account to continue',
})

const login = useSignIn('social')

const providers: ButtonProps[] = [{
  label: 'Google',
  icon: 'simple-icons:google',
  color: 'secondary',
  variant: 'solid',
  size: 'xl',
  onClick: () => {
    login.execute({ provider: 'google' })
  },
}]
</script>

<template>
  <UContainer class="max-w-md min-h-dvh flex flex-col items-center justify-center gap-8">
    <NuxtImg src="/images/logos/logo-square-white.png" class="size-40" />

    <UCard>
      <UAuthForm
        :providers
        icon="ph:lock"
        :ui="{
          leadingIcon: 'text-primary',
          title: 'font-display font-light tracking-tight',
        }"
      >
        <template #title>
          welcome back, <i>lumity</i>
        </template>
        <template #footer>
          By signing in, you agree to our <ULink to="/" class="text-primary font-medium">Terms of Service</ULink>.
        </template>
      </UAuthForm>
    </UCard>
  </UContainer>
</template>
