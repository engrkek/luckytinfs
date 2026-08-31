<script setup lang="ts">
import type { FormSubmitEvent, SelectItem } from '@nuxt/ui'
import type { CEvent } from '#shared/types'
import { z } from 'zod'

const props = defineProps<{
  event: CEvent
}>()

const open = defineModel<boolean>('open', { default: false })
const form = useTemplateRef('form')

const statuses: SelectItem[] = [
  { value: 'for_review', label: 'For review' },
  { value: 'approved', label: 'Approved' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'invalid', label: 'Invalid' },
]

const schema = z.object({
  fullName: z.string('Name is required').min(1, 'Name is required'),
  nickname: z.string().optional(),
  email: z.email('Invalid email').optional(),
  socialPlatform: z.string().optional(),
  socialHandle: z.string().optional(),
  regFee: z.number().nonnegative().optional(),
  refNo: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['for_review', 'approved', 'confirmed', 'invalid']),
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  status: 'for_review',
  regFee: props.event.fee != null ? props.event.fee / 100 : undefined,
})

const toast = useToast()

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const { regFee, ...rest } = event.data
  const payload = {
    ...rest,
    regFee: regFee !== undefined ? Math.round(regFee * 100) : undefined,
  }

  try {
    await $fetch(`/api/office/events/${props.event.id}/rsvps`, { method: 'POST', body: payload })
    await refreshNuxtData(`event-${props.event.id}-rsvps`)
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
  <AppSheet v-model:open="open" title="Add Registration" :description="`Register a new RSVP for ${event.name}`">
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

      <UFormField name="email" label="Email">
        <UInput v-model="state.email" type="email" placeholder="Enter email" />
      </UFormField>

      <div class="grid grid-cols-2 gap-4">
        <UFormField name="socialPlatform" label="Social Platform">
          <UInput v-model="state.socialPlatform" placeholder="e.g. Instagram" />
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
