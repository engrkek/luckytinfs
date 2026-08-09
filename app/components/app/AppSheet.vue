<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
const emit = defineEmits<{ close: [boolean] }>()
const open = defineModel<boolean>('open', { default: false })

const isDesktop = useMediaQuery('(min-width: 768px)', { ssrWidth: 767 })
</script>

<template>
  <USlideover
    v-if="isDesktop"
    v-model:open="open"
    :title
    :description
    :close="{ onClick: () => emit('close', false) }"
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
    :close="{ onClick: () => emit('close', false) }"
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
