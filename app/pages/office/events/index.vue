<script setup lang="ts">
import type { CEvent } from '#shared/types'
import { LazyOfficeEventForm } from '#components'

useHead({ title: 'Events' })

const overlay = useOverlay()
const eventForm = overlay.create(LazyOfficeEventForm)
const isDesktop = useMediaQuery('(min-width: 768px)', { ssrWidth: 767 })

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

      <UCard v-if="isDesktop" :ui="{ body: 'p-0 lg:p-0' }">
        <div class="flex flex-wrap items-center gap-2 p-3">
          <UInput icon="ph:magnifying-glass" placeholder="Search events..." class="flex-1 min-w-60 lg:max-w-60" />
          <UDropdownMenu
            :items="[
              { icon: 'ph:printer', label: 'Print' },
              { icon: 'ph:file-csv', label: 'CSV' },
              { icon: 'ph:copy', label: 'Copy' },
            ]"
            class="lg:ml-auto"
          >
            <UButton label="Export" trailing-icon="ph:caret-down" color="neutral" variant="soft" />
          </UDropdownMenu>
        </div>

        <OfficeEventTable v-if="events" :events="events" />
      </UCard>

      <template v-else>
        <div v-if="events && events.length > 0" class="grid gap-2">
          <div class="flex flex-wrap items-center gap-2">
            <UInput icon="ph:magnifying-glass" placeholder="Search events..." class="flex-1 min-w-60 lg:max-w-60" />
            <UDropdownMenu
              :items="[
                { icon: 'ph:printer', label: 'Print' },
                { icon: 'ph:file-csv', label: 'CSV' },
                { icon: 'ph:copy', label: 'Copy' },
              ]"
              class="lg:ml-auto"
            >
              <UButton label="Export" trailing-icon="ph:caret-down" color="neutral" variant="soft" />
            </UDropdownMenu>
          </div>

          <UPageCard v-for="event in events" :key="event.id" :to="`/office/events/${event.id}`">
            <h2 class="font-display font-bold text-xl tracking-tighter">
              {{ event.name }}
            </h2>
          </UPageCard>
        </div>

        <UEmpty v-else icon="ph:calendar-blank" title="No events yet" description="Create one to start managing an event." />
      </template>
    </template>
  </UDashboardPanel>
</template>
