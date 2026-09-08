<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Channel } from '#shared/types'
import { z } from 'zod'

const props = defineProps<{
  type: 'new' | 'edit'
  channel?: Channel
}>()

const typeItems = ['gcash', 'maya', 'gotyme', 'bank', 'other']

const open = defineModel<boolean>('open', { default: false })
const form = useTemplateRef('form')

const title = computed(() => props.type === 'new' ? 'Add Wallet' : 'Edit Wallet')
const description = computed(() => props.type === 'new' ? 'Add a payment channel donors can send to' : `Update ${props.channel?.nickname || props.channel?.type}`)

const schema = z.object({
  type: z.string('Type is required').min(1, 'Type is required'),
  nickname: z.string().optional(),
  accountName: z.string('Account name is required').min(1, 'Account name is required'),
  accountIdentifier: z.string('Account number/handle is required').min(1, 'Account number/handle is required'),
})
type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  type: props.channel?.type,
  nickname: props.channel?.nickname ?? undefined,
  accountName: props.channel?.accountName,
  accountIdentifier: props.channel?.accountIdentifier,
})
const qr = ref<File | null>(null)

const toast = useToast()

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    let qrUrl: string | undefined
    if (qr.value) {
      const body = new FormData()
      body.append('qr', qr.value)
      const { pathname } = await $fetch<{ pathname: string }>('/api/office/channels/qr', { method: 'POST', body })
      qrUrl = `/images/${pathname}`
    }

    const payload = { ...event.data, ...(qrUrl ? { qrUrl } : {}) }

    if (props.type === 'new')
      await $fetch('/api/office/channels', { method: 'POST', body: payload })
    else
      await $fetch(`/api/office/channels/${props.channel!.id}`, { method: 'PATCH', body: payload })

    await refreshNuxtData('office-channels')
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
      <UFormField name="type" label="Type" required>
        <USelect v-model="state.type" :items="typeItems" placeholder="Select a type" class="w-full" />
      </UFormField>

      <UFormField name="nickname" label="Nickname" hint="Optional">
        <UInput v-model="state.nickname" placeholder="e.g. Main GCash" />
      </UFormField>

      <UFormField name="accountName" label="Account Name" required>
        <UInput v-model="state.accountName" placeholder="Name on the account" />
      </UFormField>

      <UFormField name="accountIdentifier" label="Account Number / Handle" required>
        <UInput v-model="state.accountIdentifier" placeholder="Phone number, account number, or email" />
      </UFormField>

      <UFormField label="QR Code" hint="Optional">
        <UFileUpload v-model="qr" accept="image/*" label="Drop a QR code image here" />
        <img v-if="!qr && channel?.qrUrl" :src="channel.qrUrl" alt="Current QR code" class="mt-2 size-24 rounded object-cover">
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
