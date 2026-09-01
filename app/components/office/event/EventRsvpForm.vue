<script setup lang="ts">
import type { FormSubmitEvent, SelectItem } from '@nuxt/ui'
import type { CEvent, EventRsvp } from '#shared/types'
import { z } from 'zod'

const props = defineProps<{
  type: 'new' | 'edit'
  event: CEvent
  rsvp?: EventRsvp
}>()

const open = defineModel<boolean>('open', { default: false })
const form = useTemplateRef('form')

const title = computed(() => props.type === 'new' ? 'Add Registration' : 'Edit Registration')
const description = computed(() => props.type === 'new' ? `Register a new RSVP for ${props.event.name}` : `Update ${props.rsvp?.fullName}'s registration`)

const statuses: SelectItem[] = [
  { value: 'for_review', label: 'For review' },
  { value: 'approved', label: 'Approved' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'invalid', label: 'Invalid' },
]

const socialPlatforms: SelectItem[] = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'x', label: 'X (Twitter)' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'other', label: 'Other' },
]

const schema = z.object({
  fullName: z.string('Name is required').min(1, 'Name is required'),
  nickname: z.string().optional(),
  email: z.email('Invalid email').optional(),
  contactNumber: z.string().optional(),
  socialPlatform: z.string().optional(),
  socialHandle: z.string().optional(),
  regFee: z.number().nonnegative().optional(),
  refNo: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['for_review', 'approved', 'confirmed', 'invalid']),
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  fullName: props.rsvp?.fullName,
  nickname: props.rsvp?.nickname ?? undefined,
  email: props.rsvp?.email ?? undefined,
  contactNumber: props.rsvp?.contactNumber ?? undefined,
  socialPlatform: props.rsvp?.socialPlatform ?? undefined,
  socialHandle: props.rsvp?.socialHandle ?? undefined,
  regFee: props.rsvp ? (props.rsvp.regFee != null ? props.rsvp.regFee / 100 : undefined) : (props.event.fee != null ? props.event.fee / 100 : undefined),
  refNo: props.rsvp?.refNo ?? undefined,
  notes: props.rsvp?.notes ?? undefined,
  status: (props.rsvp?.status as Schema['status']) ?? 'for_review',
})

const receipt = ref<File | null>(null)
const existingReceipt = ref(props.rsvp?.receiptUrl ? { url: props.rsvp.receiptUrl, name: props.rsvp.receiptUrl.split('/').pop()! } : null)
const toast = useToast()

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const { regFee, ...rest } = event.data
  let receiptUrl: string | undefined

  if (receipt.value) {
    const form = new FormData()
    form.append('receipt', receipt.value)
    const { pathname } = await $fetch<{ pathname: string }>(`/api/office/events/${props.event.id}/rsvps/receipt`, { method: 'POST', body: form })
    receiptUrl = `/images/${pathname}`
  }

  const payload = {
    ...rest,
    regFee: regFee !== undefined ? Math.round(regFee * 100) : undefined,
    receiptUrl: receiptUrl ?? existingReceipt.value?.url ?? (props.type === 'edit' ? '' : undefined),
  }

  try {
    if (props.type === 'new')
      await $fetch(`/api/office/events/${props.event.id}/rsvps`, { method: 'POST', body: payload })
    else
      await $fetch(`/api/office/events/${props.event.id}/rsvps/${props.rsvp!.id}`, { method: 'PATCH', body: payload })

    await refreshNuxtData(`event-${props.event.id}-rsvps`)
    open.value = false
    receipt.value = null
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
      <UFormField name="fullName" label="Full Name" required>
        <UInput v-model="state.fullName" placeholder="Enter full name" />
      </UFormField>

      <UFormField name="nickname" label="Nickname">
        <UInput v-model="state.nickname" placeholder="Enter nickname" />
      </UFormField>

      <div class="grid grid-cols-2 gap-4">
        <UFormField name="email" label="Email">
          <UInput v-model="state.email" type="email" placeholder="Enter email" />
        </UFormField>

        <UFormField name="contactNumber" label="Contact Number">
          <UInput v-model="state.contactNumber" type="tel" placeholder="09XX XXX XXXX" />
        </UFormField>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <UFormField name="socialPlatform" label="Social Platform">
          <USelect
            v-model="state.socialPlatform"
            :items="socialPlatforms"
            value-key="value"
            placeholder="Select platform"
            class="w-full"
          />
        </UFormField>

        <UFormField name="socialHandle" label="Social Handle">
          <UInput v-model="state.socialHandle" placeholder="@handle" />
        </UFormField>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <UFormField name="regFee" label="Fee Paid">
          <UInputNumber
            v-model="state.regFee"
            :min="0"
            :step="0.01"
            :format-options="{ style: 'currency', currency: 'PHP' }"
            placeholder="Free"
          />
        </UFormField>

        <UFormField name="refNo" label="Reference No.">
          <UInput v-model="state.refNo" placeholder="Payment ref. no." />
        </UFormField>
      </div>

      <UFormField name="receipt" label="Receipt">
        <div v-if="existingReceipt" class="flex items-center gap-2 border border-default rounded-md p-2 mb-2">
          <UIcon name="ph:paperclip" class="size-5 shrink-0" />
          <ULink :to="existingReceipt.url" target="_blank" class="truncate text-sm">
            {{ existingReceipt.name }}
          </ULink>
          <UButton
            icon="ph:x"
            color="neutral"
            variant="ghost"
            size="xs"
            class="ms-auto"
            @click="existingReceipt = null"
          />
        </div>
        <UFileUpload v-model="receipt" accept="image/*,.pdf" label="Drop receipt here" />
      </UFormField>

      <UFormField name="status" label="Status" required>
        <USelect v-model="state.status" :items="statuses" value-key="value" class="w-full" />
      </UFormField>

      <UFormField name="notes" label="Notes">
        <UTextarea v-model="state.notes" placeholder="Internal notes" class="w-full" />
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
