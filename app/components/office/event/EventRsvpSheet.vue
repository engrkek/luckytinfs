<script setup lang="ts">
import type { EventRsvp } from '#shared/types'

defineProps<{ rsvp: EventRsvp }>()

const open = defineModel<boolean>('open', { default: false })
</script>

<template>
  <AppSheet v-model:open="open" title="Registration details">
    <UCard variant="soft" :ui="{ body: 'sm:p-4' }">
      <div class="flex items-center gap-3">
        <UAvatar :alt="rsvp.fullName" color="secondary" />
        <div>
          <p class="text-highlighted">
            {{ rsvp.fullName }}
          </p>
          <p class="text-sm text-muted">
            {{ rsvp.email }}
          </p>
        </div>
      </div>
    </UCard>
  </AppSheet>
</template>
