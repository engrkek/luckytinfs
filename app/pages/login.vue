<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'

useHead({
  meta: [
    { key: 'theme-color', name: 'theme-color', content: '#1f4072' },
  ],
  bodyAttrs: {
    class: 'overflow-x-hidden bg-secondary-900 text-primary-100 selection:bg-primary-300 selection:text-secondary-950',
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

    <div class="bg-linear-to-br from-primary-50 to-primary-100 px-6 py-5 drop-shadow-2xl">
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
    </div>
  </UContainer>
</template>
