<script setup lang="ts">
import type { CEvent } from '#shared/types'
import { LazyOfficeEventForm } from '#components'

useHead({ title: 'Events' })

const overlay = useOverlay()
const eventForm = overlay.create(LazyOfficeEventForm)

const { data: events } = useFetch<CEvent[]>('/api/office/events', { key: 'office-events' })
</script>

<template>
  <UDashboardPanel id="events">
    <template #body>
      <div class="flex">
        <div>
          <h1 class="font-display text-3xl tracking-tighter">
            Events
          </h1>
          <p class="text-muted">
            Manage events here.
          </p>
        </div>
        <div class="ml-auto">
          <UButton icon="ph:plus" label="New Event" @click="eventForm.open({ type: 'new' })" />
        </div>
      </div>

      <UCard :ui="{ body: 'p-0 lg:p-0' }">
        <div class="flex flex-wrap items-center gap-2 p-3">
          <UInput icon="ph:magnifying-glass" placeholder="Search events..." class="mr-auto" />
          <UDropdownMenu
            :items="[
              { icon: 'ph:printer', label: 'Print' },
              { icon: 'ph:file-csv', label: 'CSV' },
              { icon: 'ph:copy', label: 'Copy' },
            ]"
          >
            <UButton label="Export" trailing-icon="ph:caret-down" color="neutral" variant="soft" />
          </UDropdownMenu>
        </div>

        <OfficeEventTable v-if="events" :events="events" />
      </UCard>
    </template>
  </UDashboardPanel>
</template>
