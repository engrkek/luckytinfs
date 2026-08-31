<script setup lang="ts">
import type { BreadcrumbItem, SelectItem } from '@nuxt/ui'
import type { CEvent, EventRsvp } from '#shared/types'
import { LazyAppDialog, LazyOfficeEventForm, LazyOfficeEventRsvpForm } from '#components'

const id = useRoute().params.id

const overlay = useOverlay()
const eventForm = overlay.create(LazyOfficeEventForm)
const rsvpForm = overlay.create(LazyOfficeEventRsvpForm)
const deleteConfirm = overlay.create(LazyAppDialog)
const toast = useToast()

const { data: event } = useFetch<CEvent>(`/api/office/events/${id}`, { key: `event-${id}` })
const { data: rsvps } = useFetch<EventRsvp[]>(`/api/office/events/${id}/rsvps`, { key: `event-${id}-rsvps` })

const breadcrumbs = computed<BreadcrumbItem[]>(() => [
  { label: 'Events', to: '/office/events' },
  { label: event.value?.name, to: `/office/events/${event.value?.id}` },
])

const status = ref('all')

async function toggleOpen() {
  await $fetch(`/api/office/events/${id}`, { method: 'PATCH', body: { isOpen: !event.value!.isOpen } })
  await refreshNuxtData(`event-${id}`)
}

async function deleteEvent() {
  const confirmed = await deleteConfirm.open({
    title: 'Delete event',
    description: `This will permanently delete "${event.value?.name}". This cannot be undone.`,
    confirmLabel: 'Delete',
    color: 'error',
  })
  if (!confirmed)
    return

  try {
    await $fetch(`/api/office/events/${id}`, { method: 'DELETE' })
    await navigateTo('/office/events')
  }
  catch (err) {
    const e = err as { data?: { statusMessage?: string }, message?: string }
    toast.add({
      icon: 'ph:x-circle',
      title: 'Delete failed',
      description: e.data?.statusMessage ?? e.message ?? 'Something went wrong',
      color: 'error',
    })
  }
}

const statuses: SelectItem[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'for_review', label: 'For review' },
  { value: 'approved', label: 'Approved' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'invalid', label: 'Invalid' },
]
</script>

<template>
  <UDashboardPanel :id="`event-${id}`">
    <template v-if="event" #body>
      <div class="flex flex-col lg:flex-row lg:items-center gap-2">
        <UBreadcrumb :items="breadcrumbs" />

        <div>
          <div class="flex flex-wrap items-center gap-2">
            <h1 class="font-display font-bold text-2xl tracking-tighter text-pretty">
              {{ event.name }}
            </h1>
            <UBadge :label="event.isOpen ? 'Open' : 'Closed'" :color="event.isOpen ? 'success' : 'error'" variant="soft" size="xl" />
          </div>
          <div class="flex items-center gap-2 text-muted">
            <UIcon name="ph:map-pin" />
            <p>{{ event.venue }}</p>
          </div>
        </div>

        <div class="lg:ml-auto flex flex-wrap items-center gap-2">
          <UButton
            icon="ph:pencil"
            label="Edit event"
            color="neutral"
            variant="soft"
            @click="eventForm.open({ type: 'edit', event })"
          />
          <UButton
            icon="ph:power"
            :label="event.isOpen ? 'Close event' : 'Open event'"
            color="neutral"
            variant="soft"
            loading-auto
            @click="toggleOpen"
          />
          <UButton
            icon="ph:trash"
            label="Delete event"
            color="error"
            variant="soft"
            @click="deleteEvent"
          />
        </div>
      </div>

      <UCard>
        <h2 class="font-semibold text-lg">
          Capacity
        </h2>
        <p>
          <span class="text-highlighted text-2xl">{{ rsvps && rsvps.length }}</span> <span class="text-muted text-lg">/ {{ event.capacity }} slots</span>
        </p>
      </UCard>

      <UCard :ui="{ body: 'p-0 lg:p-0' }">
        <div class="flex flex-wrap items-center gap-2 p-3">
          <UInput icon="ph:magnifying-glass" placeholder="Search registration..." class="flex-1 min-w-60 lg:max-w-60" />

          <UButton icon="ph:plus" label="Add registration" class="lg:ml-auto" @click="rsvpForm.open({ event })" />
          <USelect v-model="status" :items="statuses" value-key="value" />
        </div>
        <UTable :data="rsvps" empty="No registrations yet." />
      </UCard>
    </template>
  </UDashboardPanel>
</template>
