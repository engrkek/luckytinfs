<script setup lang="ts">
import type { FormSubmitEvent, SelectItem } from '@nuxt/ui'
import type { DonationStatus } from '#shared/donations'
import type { Campaign, Channel } from '#shared/types'
import type { OfficeDonation } from '~/composables/useOfficeDonations'
import { z } from 'zod'

const props = defineProps<{ donation: OfficeDonation }>()

const open = defineModel<boolean>('open', { default: false })
const form = useTemplateRef('form')

const { data: campaigns } = await useFetch<Campaign[]>('/api/campaigns')
const { data: channels } = await useFetch<Channel[]>('/api/channels')

const { mutate: updateDonation, isLoading } = useUpdateOfficeDonation()

const statusItems: SelectItem[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'invalid', label: 'Invalid' },
]

const displayOptions: SelectItem[] = [
  { value: 'both', label: 'Name & handle' },
  { value: 'handle_only', label: 'Handle only' },
  { value: 'name_only', label: 'Name only' },
  { value: 'anon', label: 'Anonymous' },
]

const socialItems: SelectItem[] = [
  { value: 'x', label: 'X / Twitter' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'reddit', label: 'Reddit' },
  { value: 'threads', label: 'Threads' },
]

const campaignItems = computed<SelectItem[]>(() => [
  { value: '__general', label: 'Wherever it\'s needed most' },
  ...(campaigns.value ?? []).map(c => ({ value: c.id, label: c.title })),
])

const channelItems = computed<SelectItem[]>(() => (channels.value ?? []).map(c => ({
  value: c.id,
  label: c.nickname ? `${c.nickname} (${c.accountName})` : `${c.type} (${c.accountName})`,
})))

const schema = z.object({
  campaignId: z.string(),
  amount: z.number('Enter an amount').positive('Enter an amount above ₱0'),
  channelId: z.string().min(1, 'Choose a payment method'),
  refNo: z.string().optional(),
  status: z.enum(['pending', 'approved', 'invalid']),
  display: z.enum(['both', 'handle_only', 'name_only', 'anon']),
  donorName: z.string().optional(),
  donorSocial: z.string().min(1, 'Choose a platform'),
  donorHandle: z.string().min(1, 'Handle is required'),
  donorEmail: z.email('Enter a valid email'),
  donorNotes: z.string().optional(),
  adminNotes: z.string().optional(),
})
type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  campaignId: props.donation.campaignId ?? '__general',
  amount: props.donation.amount / 100,
  channelId: props.donation.channelId,
  refNo: props.donation.refNo ?? undefined,
  status: props.donation.status as DonationStatus,
  display: props.donation.display as Schema['display'],
  donorName: props.donation.donor.name,
  donorSocial: props.donation.donor.social,
  donorHandle: props.donation.donor.handle,
  donorEmail: props.donation.donor.email,
  donorNotes: props.donation.donorNotes ?? undefined,
  adminNotes: props.donation.adminNotes ?? undefined,
})

const proof = ref<File | null>(null)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  let proofUrl: string | undefined
  if (proof.value) {
    const body = new FormData()
    body.append('proof', proof.value)
    const { pathname } = await $fetch<{ pathname: string }>('/api/donations/proof', { method: 'POST', body })
    proofUrl = `/images/${pathname}`
  }

  updateDonation({
    id: props.donation.id,
    campaignId: event.data.campaignId === '__general' ? null : event.data.campaignId,
    amount: Math.round(event.data.amount * 100),
    channelId: event.data.channelId,
    refNo: event.data.refNo,
    status: event.data.status,
    proofUrl,
    display: event.data.display,
    donorNotes: event.data.donorNotes,
    adminNotes: event.data.adminNotes,
    donor: {
      name: event.data.donorName,
      social: event.data.donorSocial,
      handle: event.data.donorHandle,
      email: event.data.donorEmail,
    },
  })
  open.value = false
}
</script>

<template>
  <AppSheet v-model:open="open" title="Edit donation" :description="`${donation.donor.name}'s donation`">
    <UForm
      ref="form"
      :schema
      :state
      class="grid gap-4"
      @submit="onSubmit"
    >
      <UFormField name="campaignId" label="Cause">
        <USelect v-model="state.campaignId" :items="campaignItems" value-key="value" class="w-full" />
      </UFormField>

      <UFormField name="amount" label="Amount">
        <UInputNumber
          v-model="state.amount"
          :min="1"
          :step="1"
          :step-snapping="false"
          :format-options="{ style: 'currency', currency: 'PHP' }"
          class="w-full"
        />
      </UFormField>

      <UFormField name="channelId" label="Channel" required>
        <USelect v-model="state.channelId" :items="channelItems" value-key="value" class="w-full" />
      </UFormField>

      <UFormField name="refNo" label="Reference No.">
        <UInput v-model="state.refNo" placeholder="Payment ref. no." />
      </UFormField>

      <UFormField name="status" label="Status" required>
        <USelect v-model="state.status" :items="statusItems" value-key="value" class="w-full" />
      </UFormField>

      <UFormField name="display" label="Credit as" required>
        <USelect v-model="state.display" :items="displayOptions" value-key="value" class="w-full" />
      </UFormField>

      <UFormField label="Proof of payment">
        <div v-if="donation.proofUrl" class="mb-2">
          <NuxtImg :src="donation.proofUrl" class="max-h-40 rounded-md border border-default object-cover" />
        </div>
        <UFileUpload v-model="proof" accept="image/*,.pdf" label="Drop a screenshot to replace it" />
      </UFormField>

      <p class="text-xs font-bold text-muted uppercase tracking-wide">
        Donor
      </p>

      <UFormField name="donorName" label="Name">
        <UInput v-model="state.donorName" placeholder="Leave blank to stay anonymous" class="w-full" />
      </UFormField>

      <UFormField name="donorSocial" label="Where can we find them?" required>
        <USelect v-model="state.donorSocial" :items="socialItems" value-key="value" class="w-full" />
      </UFormField>

      <UFormField name="donorHandle" label="Handle" required>
        <UInput v-model="state.donorHandle" placeholder="@handle" class="w-full" />
      </UFormField>

      <UFormField name="donorEmail" label="Email" required>
        <UInput v-model="state.donorEmail" type="email" class="w-full" />
      </UFormField>

      <UFormField name="donorNotes" label="Donor notes">
        <UTextarea v-model="state.donorNotes" placeholder="From the donor" class="w-full" />
      </UFormField>

      <UFormField name="adminNotes" label="Internal notes">
        <UTextarea v-model="state.adminNotes" placeholder="Visible to admins only…" class="w-full" />
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
        color="secondary"
        size="lg"
        block
        :loading="isLoading"
        @click="form?.submit"
      />
    </template>
  </AppSheet>
</template>
