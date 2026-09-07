<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'

definePageMeta({ layout: 'auth' })

useSeoMeta({
  title: 'Login',
  description: 'Login to your account to continue',
})

const login = useSignIn('social')

const providers: ButtonProps[] = [{
  label: 'Google',
  icon: 'simple-icons:google',
  variant: 'solid',
  color: 'primary',
  size: 'xl',
  class: 'rounded-full',
  onClick: () => {
    login.execute({ provider: 'google' })
  },
}]
</script>

<template>
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
      By signing in, you agree to our <ULink to="/terms" class="text-primary font-medium">Terms of Service</ULink>.
    </template>
  </UAuthForm>
</template>
