<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'
import type { RsvpStatus } from '#shared/events'
import type { CEvent, OfficeEventRsvp } from '#shared/types'
import { LazyAppDialog, LazyOfficeEventForm, LazyOfficeEventRsvpForm } from '#components'
import { RSVP_STATUS_ITEMS, rsvpStatus } from '#shared/events'

const id = useRoute().params.id

const overlay = useOverlay()
const eventForm = overlay.create(LazyOfficeEventForm)
const rsvpForm = overlay.create(LazyOfficeEventRsvpForm)
const deleteConfirm = overlay.create(LazyAppDialog)
const toast = useToast()

const { data: event } = useFetch<CEvent>(`/api/office/events/${id}`, { key: `event-${id}` })
const { data: rsvps } = useFetch<OfficeEventRsvp[]>(`/api/office/events/${id}/rsvps`, { key: `event-${id}-rsvps` })

useHead({ title: () => event.value?.name ?? 'Event' })

const breadcrumbs = computed<BreadcrumbItem[]>(() => [
  { label: 'Events', to: '/office/events' },
  { label: event.value?.name, to: `/office/events/${event.value?.id}` },
])

const status = ref<RsvpStatus | 'all'>('all')
const search = ref('')
const page = ref(1)
watch([search, status], () => page.value = 1)

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 })
const dateFormat = new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short' })

const counts = computed(() => {
  const c: Partial<Record<RsvpStatus, number>> = {}
  for (const r of rsvps.value ?? [])
    c[r.status as RsvpStatus] = (c[r.status as RsvpStatus] ?? 0) + 1
  return c
})

const statusItems = computed(() => [
  { value: 'all', label: `All statuses (${rsvps.value?.length ?? 0})` },
  ...RSVP_STATUS_ITEMS.map(i => ({ ...i, label: `${i.label} (${counts.value[i.value as RsvpStatus] ?? 0})` })),
])

// ponytail: filtered client-side off the full list; move to query params when an event outgrows one fetch
const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return (rsvps.value ?? []).filter(r =>
    (status.value === 'all' || r.status === status.value)
    && (!q || [r.regId, r.fullName, r.nickname, r.email, r.contactNumber, r.socialHandle].some(v => v?.toLowerCase().includes(q))),
  )
})

function exportCsv() {
  downloadCsv(csvFilename(`${event.value!.slug}-registrations`), filtered.value, {
    'Reg ID': r => r.regId,
    'Full name': r => r.fullName,
    'Nickname': r => r.nickname,
    'Email': r => r.email,
    'Mobile': r => r.contactNumber,
    'Platform': r => r.socialPlatform,
    'Handle': r => r.socialHandle,
    'Status': r => rsvpStatus(r.status).label,
    'Sponsored kids': r => r.sponsoredKids,
    'Own kids': r => r.companions?.length ?? 0,
    'Own kids (names)': r => r.companions?.map(c => c.relationship ? `${c.name} (${c.relationship})` : c.name).join('; '),
    'Fee paid': r => r.regFee != null ? r.regFee / 100 : '',
    'Paid to': r => r.channelLabel,
    'Reference no.': r => r.refNo,
    'Reviewed by': r => r.reviewerName,
    'Notes': r => r.notes,
    'Registered': r => csvDate(r.createdAt),
  })
}

// Who's actually coming: cancelled/rejected registrations don't take seats
const attendance = computed(() => {
  const active = (rsvps.value ?? []).filter(r => r.status !== 'cancelled' && r.status !== 'rejected')
  const confirmed = active.filter(r => r.status === 'confirmed')
  const sponsored = (list: OfficeEventRsvp[]) => list.reduce((n, r) => n + r.sponsoredKids, 0)
  const ownKids = (list: OfficeEventRsvp[]) => list.reduce((n, r) => n + (r.companions?.length ?? 0), 0)
  const kids = sponsored(active) + ownKids(active)
  return [
    {
      label: 'Sponsored kids',
      value: sponsored(active),
      hint: `from ${active.filter(r => r.sponsoredKids).length} sponsors · ${sponsored(confirmed)} confirmed`,
    },
    {
      label: 'Own kids',
      value: ownKids(active),
      hint: `from ${active.filter(r => r.companions?.length).length} attendees · ${ownKids(confirmed)} confirmed`,
    },
    {
      label: 'Expected headcount',
      value: active.length + kids,
      hint: `${active.length} adults · ${kids} kids`,
    },
  ]
})

const stats = computed(() => {
  const c = counts.value
  const active = (rsvps.value?.length ?? 0) - (c.cancelled ?? 0) - (c.rejected ?? 0)
  const all = rsvps.value ?? []
  const paid = all.filter(r => r.status === 'confirmed')
  const sumFees = (list: OfficeEventRsvp[]) => list.reduce((sum, r) => sum + (r.regFee ?? 0), 0) / 100
  const inReview = sumFees(all.filter(r => r.status === 'for_review'))
  const unrecorded = paid.filter(r => r.regFee == null).length
  const capacity = event.value?.capacity
  return [
    {
      label: 'Collected',
      value: peso.format(sumFees(paid)),
      // Surface gaps instead of silently undercounting (imported rows carry no fee)
      hint: [`${peso.format(inReview)} in review`, unrecorded && `${unrecorded} paid with no fee recorded`].filter(Boolean).join(' · '),
      filter: undefined,
    },
    {
      label: 'Registered',
      value: capacity ? `${active} / ${capacity}` : active,
      hint: capacity ? `${Math.max(capacity - active, 0)} slots left` : 'no capacity limit',
      progress: capacity ? Math.min(active / capacity, 1) * 100 : undefined,
      filter: 'all',
    },
    { label: 'For review', value: c.for_review ?? 0, hint: `${c.pending_payment ?? 0} still unpaid`, filter: 'for_review' },
    { label: 'Confirmed', value: c.confirmed ?? 0, hint: 'payment verified', filter: 'confirmed' },
  ] as const
})

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
</script>

<template>
  <UDashboardPanel :id="`event-${id}`">
    <template v-if="event" #body>
      <UBreadcrumb :items="breadcrumbs" />

      <div class="flex flex-col lg:flex-row lg:items-center gap-2">
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <h1 class="font-display font-bold text-2xl tracking-tighter text-pretty">
              {{ event.name }}
            </h1>
            <UBadge :label="event.isOpen ? 'Open' : 'Closed'" :color="event.isOpen ? 'success' : 'error'" variant="soft" size="xl" />
          </div>
          <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted">
            <p class="flex items-center gap-1.5">
              <UIcon name="ph:calendar-blank" class="shrink-0" />
              {{ dateFormat.format(new Date(event.date)) }}
            </p>
            <p v-if="event.venue" class="flex items-center gap-1.5">
              <UIcon name="ph:map-pin" class="shrink-0" />
              {{ event.venue }}
            </p>
            <p class="flex items-center gap-1.5">
              <UIcon name="ph:ticket" class="shrink-0" />
              {{ event.fee ? peso.format(event.fee / 100) : 'Free' }}
            </p>
          </div>
        </div>

        <div class="lg:ml-auto flex flex-wrap items-center lg:justify-end gap-2">
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

      <!-- Each card filters the table below; aria-pressed + ring is the static selected cue -->
      <div class="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <UPageCard
          v-for="stat in stats"
          :key="stat.label"
          :as="stat.filter ? 'button' : 'div'"
          :type="stat.filter ? 'button' : undefined"
          variant="subtle"
          :aria-pressed="stat.filter ? status === stat.filter : undefined"
          class="text-left transition-[box-shadow] duration-150 aria-pressed:ring-2 aria-pressed:ring-primary"
          :class="{ 'cursor-pointer': stat.filter }"
          :ui="{ container: 'gap-1' }"
          @click="stat.filter && (status = status === stat.filter ? 'all' : stat.filter)"
        >
          <p class="text-muted text-sm">
            {{ stat.label }}
          </p>
          <p class="font-display text-3xl tracking-tighter tabular-nums">
            {{ stat.value }}
          </p>
          <UProgress v-if="'progress' in stat && stat.progress !== undefined" :model-value="stat.progress" size="xs" class="my-1" />
          <p class="text-dimmed text-xs">
            {{ stat.hint }}
          </p>
        </UPageCard>
      </div>

      <div class="grid gap-4 sm:grid-cols-3">
        <UPageCard
          v-for="stat in attendance"
          :key="stat.label"
          variant="subtle"
          :ui="{ container: 'gap-1' }"
        >
          <p class="text-muted text-sm">
            {{ stat.label }}
          </p>
          <p class="font-display text-3xl tracking-tighter tabular-nums">
            {{ stat.value }}
          </p>
          <p class="text-dimmed text-xs">
            {{ stat.hint }}
          </p>
        </UPageCard>
      </div>

      <UCard :ui="{ body: 'p-0 lg:p-0' }">
        <div class="flex flex-wrap items-center gap-2 p-3">
          <UInput v-model="search" icon="ph:magnifying-glass" placeholder="Search name, Reg ID, email…" class="flex-1 min-w-60 lg:max-w-60" />

          <UButton
            icon="ph:download-simple"
            label="Export CSV"
            color="neutral"
            variant="soft"
            class="lg:ml-auto"
            :disabled="!filtered.length"
            @click="exportCsv"
          />
          <UButton icon="ph:plus" label="Add registration" @click="rsvpForm.open({ type: 'new', event })" />
          <USelect v-model="status" :items="statusItems" value-key="value" class="min-w-44" />
        </div>
        <OfficeEventRsvpTable
          v-if="rsvps"
          v-model:page="page"
          :event="event"
          :rsvps="filtered"
          :empty="rsvps.length ? 'No registrations match your search or filter.' : 'No registrations yet.'"
        />
      </UCard>
    </template>
  </UDashboardPanel>
</template>
