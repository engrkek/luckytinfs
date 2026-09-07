<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'

defineProps<{ links: ButtonProps[] }>()

const open = defineModel<boolean>('open', { default: false })
</script>

<template>
  <USlideover v-model:open="open" :ui="{ overlay: 'bg-secondary-700/75', content: 'max-w-lg bg-secondary-600 text-white divide-secondary-700' }">
    <template #title>
      <NuxtImg src="/images/logos/logo-hr-white.png" class="h-5" />
    </template>
    <template #close>
      <UButton icon="tabler:x" variant="ghost" class="ml-auto" />
    </template>
    <template #body>
      <div class="grid gap-2 text-center">
        <NuxtLink v-for="(link, index) in links" :key="index" :to="link.to" class="font-extrabold text-lg uppercase hover:text-primary">
          {{ link.label }}
        </NuxtLink>
      </div>
    </template>
  </USlideover>
</template>
