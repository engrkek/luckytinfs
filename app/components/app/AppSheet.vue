<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
}>()

const open = defineModel<boolean>('open', { default: false })

const isDesktop = useMediaQuery('(min-width: 768px)', { ssrWidth: 767 })
</script>

<template>
  <USlideover
    v-if="isDesktop"
    v-model:open="open"
    :title
    :description
    class="max-w-lg"
  >
    <template #header>
      <slot name="header" />
    </template>

    <template #body>
      <slot />
    </template>

    <template #footer>
      <slot name="footer" />
    </template>
  </USlideover>

  <UDrawer
    v-else
    v-model:open="open"
    :title
    :description
  >
    <template #header>
      <slot name="header" />
    </template>

    <template #body>
      <slot />
    </template>

    <template #footer>
      <slot name="footer" />
    </template>
  </UDrawer>
</template>
