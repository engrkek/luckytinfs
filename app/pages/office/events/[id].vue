<script setup lang="ts">
import { eventQuery } from '~/queries/event'

const route = useRoute()
const eventId = route.params.id as string
const { data: event } = useQuery(eventQuery({ id: eventId }))

const title = computed(() => event.value?.title)

useHead({ title })
</script>

<template>
  <UContainer v-if="event" class="max-w-3xl py-6 space-y-5">
    <div class="space-y-2">
      <h1 class="font-display text-3xl text-primary-100 tracking-tighter">
        {{ event.title }}
      </h1>
    </div>
  </UContainer>
</template>
