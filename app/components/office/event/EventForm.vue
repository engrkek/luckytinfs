<script setup lang="ts">
import type { CEvent } from '#shared/types'

const props = defineProps<{
  type: 'new' | 'edit'
  event?: CEvent
}>()

const open = ref(false)

const title = computed(() => props.type === 'new' ? 'Create Event' : 'Edit Event')
const description = computed(() => props.type === 'new' ? 'Enter event name, description, and details' : `Update ${props.event?.name}`)
</script>

<template>
  <AppSheet v-model:open="open" :title :description>
    <UForm />
  </AppSheet>
</template>
