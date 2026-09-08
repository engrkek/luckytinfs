<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Tier } from '#shared/types'
import { z } from 'zod'

const props = defineProps<{
  type: 'new' | 'edit'
  campaignId: string
  tier?: Tier
}>()

const open = defineModel<boolean>('open', { default: false })
const form = useTemplateRef('form')

const title = computed(() => props.type === 'new' ? 'Add Tier' : 'Edit Tier')
const description = computed(() => props.type === 'new' ? 'Reward donors once the campaign reaches an amount' : `Update ${props.tier?.name}`)

const schema = z.object({
  name: z.string('Name is required').min(1, 'Name is required'),
  minAmount: z.number('Enter an amount').positive('Enter an amount above ₱0'),
  items: z.string('List at least one perk').min(1, 'List at least one perk'),
})
type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  name: props.tier?.name,
  minAmount: props.tier?.minAmount ? props.tier.minAmount / 100 : undefined,
  items: props.tier?.items.join('\n'),
})

const toast = useToast()

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const payload = {
    campaignId: props.campaignId,
    name: event.data.name,
    minAmount: Math.round(event.data.minAmount * 100),
    items: event.data.items.split('\n').map(i => i.trim()).filter(Boolean),
  }

  try {
    if (props.type === 'new')
      await $fetch('/api/office/tiers', { method: 'POST', body: payload })
    else
      await $fetch(`/api/office/tiers/${props.tier!.id}`, { method: 'PATCH', body: payload })

    await refreshNuxtData('office-tiers')
    open.value = false
    form.value?.clear()
  }
  catch (err) {
    const e = err as { data?: { statusMessage?: string }, message?: string }
    toast.add({
      icon: 'ph:x-circle',
      title: 'Save failed',
      description: e.data?.statusMessage ?? e.message ?? 'Something went wrong',
      color: 'error',
    })
  }
}
</script>

<template>
  <AppSheet v-model:open="open" :title :description>
    <UForm
      ref="form"
      :schema
      :state
      class="grid gap-4"
      @submit="onSubmit"
    >
      <UFormField name="name" label="Tier Name" required>
        <UInput v-model="state.name" placeholder="e.g. Tier 1" />
      </UFormField>

      <UFormField name="minAmount" label="Minimum Amount" required>
        <UInputNumber
          v-model="state.minAmount"
          :min="1"
          :step="1"
          :step-snapping="false"
          :format-options="{ style: 'currency', currency: 'PHP' }"
          class="w-full"
        />
      </UFormField>

      <UFormField name="items" label="Perks" required hint="One per line">
        <UTextarea v-model="state.items" placeholder="1x Unseen photocard&#10;1x Handbanner" class="w-full" :rows="4" />
      </UFormField>
    </UForm>

    <template #footer>
      <UButton
        label="Cancel"
        color="neutral"
        variant="soft"
        size="lg"
        block
        @click="open = false"
      />
      <UButton
        label="Save"
        size="lg"
        block
        loading-auto
        @click="form?.submit"
      />
    </template>
  </AppSheet>
</template>
