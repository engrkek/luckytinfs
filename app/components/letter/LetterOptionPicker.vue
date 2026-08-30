<script setup lang="ts">
import type { LetterAssetOption } from '#shared/letters/types'

defineProps<{
  label: string
  options: LetterAssetOption[]
  optional?: boolean
  noneLabel?: string
}>()

const model = defineModel<string>({ required: true })
</script>

<template>
  <UFormField :label="label">
    <div class="flex flex-wrap gap-2">
      <UButton
        v-if="optional"
        size="sm"
        :variant="!model ? 'solid' : 'outline'"
        :color="!model ? 'primary' : 'neutral'"
        :label="noneLabel || 'None'"
        @click="model = ''"
      />
      <UButton
        v-for="opt in options"
        :key="opt.id"
        size="sm"
        :variant="model === opt.id ? 'solid' : 'outline'"
        :color="model === opt.id ? 'primary' : 'neutral'"
        :label="opt.label"
        @click="model = opt.id"
      />
    </div>
  </UFormField>
</template>
