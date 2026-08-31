<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  color?: 'primary' | 'error' | 'neutral'
}>(), {
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  color: 'primary',
})

const emit = defineEmits<{ close: [boolean] }>()
const open = defineModel<boolean>('open', { default: false })

const isDesktop = useMediaQuery('(min-width: 768px)', { ssrWidth: 767 })
</script>

<template>
  <UModal v-if="isDesktop" v-model:open="open" :title :description>
    <template #footer>
      <UButton
        :label="cancelLabel"
        color="neutral"
        variant="soft"
        size="lg"
        block
        @click="emit('close', false)"
      />
      <UButton
        :label="confirmLabel"
        :color
        size="lg"
        block
        loading-auto
        @click="emit('close', true)"
      />
    </template>
  </UModal>

  <UDrawer v-else v-model:open="open" :title :description>
    <template #footer>
      <UButton
        :label="cancelLabel"
        color="neutral"
        variant="soft"
        size="lg"
        block
        @click="emit('close', false)"
      />
      <UButton
        :label="confirmLabel"
        :color
        size="lg"
        block
        loading-auto
        @click="emit('close', true)"
      />
    </template>
  </UDrawer>
</template>
