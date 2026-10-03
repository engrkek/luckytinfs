<script setup lang="ts">
import type { FormSubmitEvent, SelectItem } from '@nuxt/ui'
import type { OfficeExpense } from '#shared/expenses'
import type { Campaign, CEvent, Channel } from '#shared/types'
import { z } from 'zod'
import { fullAccountName } from '#shared/donations'

const props = defineProps<{ expense?: OfficeExpense }>()

const open = defineModel<boolean>('open', { default: false })
const form = useTemplateRef('form')

const { data: campaigns } = useFetch<Campaign[]>('/api/campaigns')
const { data: events } = useFetch<CEvent[]>('/api/office/events', { key: 'office-events' })
const { data: channels } = useFetch<Channel[]>('/api/office/channels', { key: 'office-channels' })

// Select values can't be null, so cash and "general" get sentinel values
const CASH = '__cash'
const GENERAL = '__general'

const walletItems = computed<SelectItem[]>(() => [
  { value: CASH, label: 'Cash', icon: 'ph:money' },
  ...(channels.value ?? []).map(c => ({ value: c.id, label: `${c.nickname || c.type} (${fullAccountName(c)})` })),
])

const forItems = computed<SelectItem[]>(() => [
  { value: GENERAL, label: 'General / overhead' },
  ...(campaigns.value?.length ? [{ type: 'label' as const, label: 'Projects' }] : []),
  ...(campaigns.value ?? []).map(c => ({ value: `campaign:${c.id}`, label: c.title })),
  ...(events.value?.length ? [{ type: 'label' as const, label: 'Events' }] : []),
  ...(events.value ?? []).map(e => ({ value: `event:${e.id}`, label: e.name })),
])

const schema = z.object({
  title: z.string('What was it for?').trim().min(1, 'What was it for?'),
  amount: z.number('Enter an amount').positive('Enter an amount above ₱0'),
  spentAt: z.string().min(1, 'Pick a date'),
  wallet: z.string('Choose a wallet or cash').min(1, 'Choose a wallet or cash'),
  for: z.string(),
  notes: z.string().optional(),
  isPublic: z.boolean(),
})
type Schema = z.output<typeof schema>

const existing = props.expense
const today = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD in local time

const state = reactive<Partial<Schema>>({
  title: existing?.title,
  amount: existing ? existing.amount / 100 : undefined,
  spentAt: existing ? new Date(existing.spentAt).toLocaleDateString('en-CA') : today,
  wallet: existing ? (existing.channelId ?? CASH) : undefined,
  for: existing?.campaignId ? `campaign:${existing.campaignId}` : existing?.eventId ? `event:${existing.eventId}` : GENERAL,
  notes: existing?.notes ?? undefined,
  isPublic: existing?.isPublic ?? true,
})
const receipt = ref<File | null>(null)

const toast = useToast()

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    let receiptUrl: string | undefined
    if (receipt.value) {
      const body = new FormData()
      body.append('receipt', receipt.value)
      const { pathname } = await $fetch<{ pathname: string }>('/api/office/expenses/receipt', { method: 'POST', body })
      receiptUrl = `/images/${pathname}`
    }

    const [kind, id] = event.data.for.split(':')
    const payload = {
      title: event.data.title,
      amount: Math.round(event.data.amount * 100),
      spentAt: new Date(`${event.data.spentAt}T12:00:00`), // midday so the day survives timezone shifts
      channelId: event.data.wallet === CASH ? null : event.data.wallet,
      campaignId: kind === 'campaign' ? id : null,
      eventId: kind === 'event' ? id : null,
      notes: event.data.notes,
      isPublic: event.data.isPublic,
      ...(receiptUrl ? { receiptUrl } : {}),
    }

    if (existing)
      await $fetch(`/api/office/expenses/${existing.id}`, { method: 'PATCH', body: payload })
    else
      await $fetch('/api/office/expenses', { method: 'POST', body: payload })

    await refreshNuxtData('office-expenses')
    open.value = false
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
  <AppSheet
    v-model:open="open"
    :title="existing ? 'Edit Expense' : 'Add Expense'"
    :description="existing ? `Update ${existing.title}` : 'Record money spent from a wallet or cash'"
  >
    <UForm
      ref="form"
      :schema
      :state
      class="grid gap-4"
      @submit="onSubmit"
    >
      <UFormField name="title" label="Item" required>
        <UInput v-model="state.title" placeholder="e.g. Tarpaulin printing" class="w-full" />
      </UFormField>

      <UFormField name="amount" label="Amount" required>
        <UInputNumber
          v-model="state.amount"
          :min="0"
          :step="1"
          :step-snapping="false"
          :format-options="{ style: 'currency', currency: 'PHP' }"
          class="w-full"
        />
      </UFormField>

      <UFormField name="spentAt" label="Date paid" required>
        <UInput v-model="state.spentAt" type="date" :max="today" class="w-full" />
      </UFormField>

      <UFormField name="wallet" label="Paid from" required>
        <USelect
          v-model="state.wallet"
          :items="walletItems"
          value-key="value"
          placeholder="Choose a wallet or cash"
          class="w-full"
        />
      </UFormField>

      <UFormField name="for" label="Spent on">
        <USelect v-model="state.for" :items="forItems" value-key="value" class="w-full" />
      </UFormField>

      <UFormField label="Receipt" hint="Optional">
        <UFileUpload v-model="receipt" accept="image/*,application/pdf" label="Drop a receipt or invoice here" />
        <a v-if="!receipt && existing?.receiptUrl" :href="existing.receiptUrl" target="_blank" class="mt-2 inline-block text-sm text-primary underline">View current receipt</a>
      </UFormField>

      <UFormField name="notes" label="Notes" hint="Optional">
        <UTextarea v-model="state.notes" class="w-full" />
      </UFormField>

      <UFormField name="isPublic">
        <USwitch v-model="state.isPublic" label="Show on public report" description="When off, it is left out of the public list but still counted in the total." />
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
