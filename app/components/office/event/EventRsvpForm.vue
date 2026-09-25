<script setup lang="ts">
import type { FormSubmitEvent, SelectItem } from '@nuxt/ui'
import type { CEvent, Channel, EventRsvp } from '#shared/types'
import { z } from 'zod'
import { fullAccountName } from '#shared/donations'
import { REG_ID_PATTERN, RSVP_STATUS_ITEMS, RSVP_STATUS_VALUES } from '#shared/events'

const props = defineProps<{
  type: 'new' | 'edit'
  event: CEvent
  rsvp?: EventRsvp
}>()

const open = defineModel<boolean>('open', { default: false })
const form = useTemplateRef('form')

// Office list includes disabled wallets, so older registrations keep their label
const { data: channels } = useFetch<Channel[]>('/api/office/channels', { key: 'office-channels' })
const channelItems = computed<SelectItem[]>(() => (channels.value ?? []).map(c => ({
  value: c.id,
  label: `${c.nickname || c.type} (${fullAccountName(c)})`,
})))

const title = computed(() => props.type === 'new' ? 'Add Registration' : 'Edit Registration')
const description = computed(() => props.type === 'new' ? `Register a new RSVP for ${props.event.name}` : `Update ${props.rsvp?.fullName}'s registration`)

const socialPlatforms: SelectItem[] = [
  { value: 'x', label: 'X (Twitter)' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'other', label: 'Other' },
]

const schema = z.object({
  regId: z.string().trim().toUpperCase().max(20).refine(v => !v || REG_ID_PATTERN.test(v), 'Letters, numbers and dashes only, e.g. LTFI-TO0').optional(),
  fullName: z.string('Name is required').min(1, 'Name is required'),
  nickname: z.string().optional(),
  email: z.email('Invalid email').optional(),
  contactNumber: z.string().optional(),
  socialPlatform: z.string().optional(),
  socialHandle: z.string().optional(),
  regFee: z.number().nonnegative().optional(),
  refNo: z.string().optional(),
  channelId: z.string().optional(),
  sponsoredKids: z.number().int().min(0).max(20),
  companions: z.array(z.object({ name: z.string().trim().min(1, 'Name is required'), relationship: z.string().trim() })),
  notes: z.string().optional(),
  status: z.enum(RSVP_STATUS_VALUES),
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  regId: props.rsvp?.regId,
  fullName: props.rsvp?.fullName,
  nickname: props.rsvp?.nickname ?? undefined,
  email: props.rsvp?.email ?? undefined,
  contactNumber: props.rsvp?.contactNumber ?? undefined,
  socialPlatform: props.rsvp?.socialPlatform ?? undefined,
  socialHandle: props.rsvp?.socialHandle ?? undefined,
  regFee: props.rsvp ? (props.rsvp.regFee != null ? props.rsvp.regFee / 100 : undefined) : (props.event.fee != null ? props.event.fee / 100 : undefined),
  refNo: props.rsvp?.refNo ?? undefined,
  channelId: props.rsvp?.channelId ?? undefined,
  sponsoredKids: props.rsvp?.sponsoredKids ?? 0,
  companions: props.rsvp?.companions?.map(c => ({ ...c })) ?? [],
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
    regId: rest.regId || undefined, // blank: generate on create, keep current on edit
    regFee: regFee !== undefined ? Math.round(regFee * 100) : undefined,
    channelId: rest.channelId ?? (props.type === 'edit' ? null : undefined),
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
      <UFormField
        name="regId"
        label="Reg ID"
        :help="type === 'new' ? 'Leave blank to generate one' : undefined"
      >
        <UInput
          v-model="state.regId"
          :placeholder="event.regPrefix ? `${event.regPrefix}-XXXX` : 'XXXX'"
          maxlength="20"
          class="w-full"
          :ui="{ base: 'uppercase tabular-nums' }"
        />
      </UFormField>

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

      <UFormField name="sponsoredKids" label="Sponsored kids" help="Charity kids this registration pays for">
        <UInputNumber v-model="state.sponsoredKids" :min="0" :max="20" />
      </UFormField>

      <UFormField label="Own kids" help="Minors the registrant is bringing">
        <div class="space-y-2">
          <div v-for="(kid, i) in state.companions" :key="i" class="flex items-start gap-2">
            <UFormField :name="`companions.${i}.name`" class="flex-1">
              <UInput v-model="kid.name" placeholder="Name" class="w-full" />
            </UFormField>
            <UInput v-model="kid.relationship" placeholder="Relationship" class="w-36" />
            <UButton
              icon="ph:x"
              color="neutral"
              variant="ghost"
              :aria-label="`Remove ${kid.name || 'kid'}`"
              @click="state.companions!.splice(i, 1)"
            />
          </div>
          <UButton
            icon="ph:plus"
            label="Add kid"
            color="neutral"
            variant="soft"
            size="sm"
            @click="(state.companions ??= []).push({ name: '', relationship: '' })"
          />
        </div>
      </UFormField>

      <UFormField name="channelId" label="Paid to wallet">
        <USelect
          v-model="state.channelId"
          :items="channelItems"
          value-key="value"
          placeholder="Select wallet"
          class="w-full"
        />
      </UFormField>

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
        <USelect v-model="state.status" :items="RSVP_STATUS_ITEMS" value-key="value" class="w-full" />
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
