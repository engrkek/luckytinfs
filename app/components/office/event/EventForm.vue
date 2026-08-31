<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { CEvent } from '#shared/types'
import { CalendarDateTime, getLocalTimeZone } from '@internationalized/date'
import { z } from 'zod'

const props = defineProps<{
  type: 'new' | 'edit'
  event?: CEvent
}>()

function toCalendarDateTime(date: Date | string) {
  const d = date instanceof Date ? date : new Date(date)
  return new CalendarDateTime(d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes())
}

const open = defineModel<boolean>('open', { default: false })
const form = useTemplateRef('form')

const title = computed(() => props.type === 'new' ? 'Create Event' : 'Edit Event')
const description = computed(() => props.type === 'new' ? 'Enter event name, description, and details' : `Update ${props.event?.name}`)

const schema = z.object({
  name: z.string('Name is required').min(1, 'Name is required'),
  description: z.string().optional(),
  venue: z.string().optional(),
  date: z.any().refine(val => !!val, { message: 'Date is required' }),
  capacity: z.number().int().positive().optional(),
  fee: z.number().nonnegative().optional(),
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Omit<z.input<typeof schema>, 'date'>> & { date?: CalendarDateTime }>({
  name: props.event?.name,
  description: props.event?.description ?? undefined,
  venue: props.event?.venue ?? undefined,
  date: props.event?.date ? toCalendarDateTime(props.event.date) : undefined,
  capacity: props.event?.capacity ?? undefined,
  fee: props.event?.fee != null ? props.event.fee / 100 : undefined,
})

const toast = useToast()

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const { fee, date, ...rest } = event.data
  const payload = {
    ...rest,
    date: (date as CalendarDateTime).toDate(getLocalTimeZone()),
    fee: fee !== undefined ? Math.round(fee * 100) : undefined,
  }

  try {
    if (props.type === 'new')
      await $fetch('/api/office/events', { method: 'POST', body: payload })
    else
      await $fetch(`/api/office/events/${props.event!.id}`, { method: 'PATCH', body: payload })

    await refreshNuxtData('office-events')
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
      <UFormField name="name" label="Event Name" required>
        <UInput v-model="state.name" placeholder="Enter event name" />
      </UFormField>

      <UFormField name="description" label="Description">
        <UTextarea v-model="state.description" placeholder="Enter event description" />
      </UFormField>

      <UFormField name="venue" label="Venue">
        <UInput v-model="state.venue" placeholder="Enter venue" />
      </UFormField>

      <UFormField name="date" label="Date & Time" required>
        <!-- @vue-ignore Nuxt UI's InputDate .d.vue.ts mistypes modelValue as ZonedDateTime-only; runtime accepts CalendarDateTime fine -->
        <UInputDate v-model="state.date" :range="false" granularity="minute" />
      </UFormField>

      <div class="grid grid-cols-2 gap-4">
        <UFormField name="capacity" label="Capacity">
          <UInputNumber v-model="state.capacity" :min="1" placeholder="No limit" />
        </UFormField>

        <UFormField name="fee" label="Fee">
          <UInputNumber
            v-model="state.fee"
            :min="0"
            :step="0.01"
            :format-options="{
              style: 'currency',
              currency: 'PHP',
            }"
            placeholder="Free"
          />
        </UFormField>
      </div>
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
