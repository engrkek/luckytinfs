<script setup lang="ts">
import { eventsQuery } from '~/queries/event'

useHead({ title: 'Events' })

const { data: events } = useQuery(eventsQuery)
</script>

<template>
  <UContainer class="max-w-3xl py-6 space-y-5">
    <div class="space-y-2">
      <h1 class="font-display text-3xl text-primary-100 tracking-tighter">
        the events calendar
      </h1>
    </div>

    <div v-if="events && events.length > 0" class="grid gap-4">
      <UPageCard v-for="event in events" :key="event.id" :to="`/office/events/${event.id}`" class="text-neutral-700">
        <div class="grid gap-0.5">
          <h2 class="font-display text-xl text-secondary-900 tracking-tight">
            {{ event.title }}
          </h2>
          <div>
            <UBadge
              v-if="event.venue"
              icon="ph:map-pin"
              :label="event.venue"
              variant="subtle"
              class="text-sm"
            />
          </div>
        </div>
        <p class="text-toned">
          {{ event.description }}
        </p>
        <UProgress :max="event.maxGuests ?? undefined" />
      </UPageCard>
    </div>

    <UEmpty v-else icon="ph:calendar-blank" title="No events yet" description="Create an event" />
  </UContainer>
</template>
