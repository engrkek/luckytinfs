<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Campaign } from '#shared/types'
import { CalendarDate, getLocalTimeZone } from '@internationalized/date'
import { z } from 'zod'

const props = defineProps<{
  type: 'new' | 'edit'
  project?: Campaign
}>()

function toCalendarDate(date: string) {
  const d = new Date(date)
  return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate())
}

const open = defineModel<boolean>('open', { default: false })
const form = useTemplateRef('form')

const title = computed(() => props.type === 'new' ? 'Create Project' : 'Edit Project')
const description = computed(() => props.type === 'new' ? 'Enter project title, description, and dates' : `Update ${props.project?.title}`)

const schema = z.object({
  title: z.string('Title is required').min(1, 'Title is required'),
  description: z.string().optional(),
  startDate: z.any().refine(val => !!val, { message: 'Start date is required' }),
  endDate: z.any().optional(),
  goal: z.number().positive().optional(),
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Omit<z.input<typeof schema>, 'startDate' | 'endDate'>> & { startDate?: CalendarDate, endDate?: CalendarDate }>({
  title: props.project?.title,
  description: props.project?.description ?? undefined,
  startDate: props.project?.startDate ? toCalendarDate(props.project.startDate) : undefined,
  endDate: props.project?.endDate ? toCalendarDate(props.project.endDate) : undefined,
  goal: props.project?.goal ? props.project.goal / 100 : undefined,
})

const toast = useToast()

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const { startDate, endDate, goal, ...rest } = event.data
  const payload = {
    ...rest,
    startDate: (startDate as CalendarDate).toDate(getLocalTimeZone()),
    endDate: endDate ? (endDate as CalendarDate).toDate(getLocalTimeZone()) : undefined,
    goal: goal ? Math.round(goal * 100) : (props.type === 'edit' ? null : undefined),
  }

  try {
    if (props.type === 'new')
      await $fetch('/api/office/projects', { method: 'POST', body: payload })
    else
      await $fetch(`/api/office/projects/${props.project!.id}`, { method: 'PATCH', body: payload })

    await refreshNuxtData('office-projects')
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
      <UFormField name="title" label="Project Title" required>
        <UInput v-model="state.title" placeholder="Enter project title" />
      </UFormField>

      <UFormField name="description" label="Description">
        <UTextarea v-model="state.description" placeholder="Enter project description" />
      </UFormField>

      <div class="grid grid-cols-2 gap-4">
        <UFormField name="startDate" label="Start Date" required>
          <UInputDate v-model="state.startDate" :range="false" />
        </UFormField>

        <UFormField name="endDate" label="End Date">
          <UInputDate v-model="state.endDate" :range="false" />
        </UFormField>
      </div>

      <UFormField name="goal" label="Goal Amount" description="Leave blank for no fundraising goal">
        <UInputNumber
          v-model="state.goal"
          :min="1"
          :step="1"
          :step-snapping="false"
          :format-options="{ style: 'currency', currency: 'PHP' }"
          class="w-full"
        />
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
