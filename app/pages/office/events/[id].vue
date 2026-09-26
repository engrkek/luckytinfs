<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'
import type { RowSelectionState } from '@tanstack/vue-table'
import type { RsvpStatus } from '#shared/events'
import type { CEvent, OfficeEventRsvp } from '#shared/types'
import { LazyAppDialog, LazyOfficeEventForm, LazyOfficeEventRsvpForm } from '#components'
import { BLOCKSCREENING_REG_PREFIX, bulkSkipReason } from '#shared/blockscreening'
import { holdsSeats, RSVP_STATUS_ITEMS, rsvpSeats, rsvpStatus } from '#shared/events'

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
// Changing the filter clears the selection, so rows you can't see never get a bulk email
const selection = ref<RowSelectionState>({})
watch([search, status], () => {
  page.value = 1
  selection.value = {}
})

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
    'Attends': r => r.attending ? 'Yes' : 'No (sponsor only)',
    'Food': r => r.food?.map(f => `${f.name}: ${f.choice}`).join('; '),
    'Fee paid': r => r.regFee != null ? r.regFee / 100 : '',
    'Paid to': r => r.channelLabel,
    'Reference no.': r => r.refNo,
    'Reviewed by': r => r.reviewerName,
    'Notes': r => r.notes,
    'Registered': r => csvDate(r.createdAt),
  })
}

// One row: money, seats (with who fills them), then the two review queues.
// Seats and headcount are the same number (see rsvpSeats), so it's shown once.
const stats = computed(() => {
  const c = counts.value
  const all = rsvps.value ?? []
  const active = all.filter(r => holdsSeats(r.status))
  const confirmed = all.filter(r => r.status === 'confirmed')
  const sum = (list: OfficeEventRsvp[], get: (r: OfficeEventRsvp) => number) => list.reduce((n, r) => n + get(r), 0)

  const seats = sum(active, rsvpSeats)
  const adults = active.filter(r => r.attending).length
  const sponsoredKids = sum(active, r => r.sponsoredKids)
  const ownKids = sum(active, r => r.companions?.length ?? 0)
  const sponsorOnly = active.length - adults
  const capacity = event.value?.capacity

  const fees = (list: OfficeEventRsvp[]) => sum(list, r => r.regFee ?? 0) / 100
  const unrecorded = confirmed.filter(r => r.regFee == null).length

  return [
    {
      label: 'Seats taken',
      value: capacity ? `${seats} / ${capacity}` : seats,
      progress: capacity ? Math.min(seats / capacity, 1) * 100 : undefined,
      hint: [
        `${adults} adults · ${sponsoredKids} sponsored · ${ownKids} own kids`,
        sponsorOnly && `${sponsorOnly} sponsor-only`,
        capacity ? `${Math.max(capacity - seats, 0)} left` : 'no limit',
      ].filter(Boolean).join(' · '),
      filter: 'all',
    },
    {
      label: 'Collected',
      value: peso.format(fees(confirmed)),
      // Surface gaps instead of silently undercounting (imported rows carry no fee)
      hint: [`${peso.format(fees(all.filter(r => r.status === 'for_review')))} in review`, unrecorded && `${unrecorded} with no fee recorded`].filter(Boolean).join(' · '),
      filter: undefined,
    },
    { label: 'For review', value: c.for_review ?? 0, hint: `${c.pending_payment ?? 0} still unpaid`, filter: 'for_review' },
    { label: 'Confirmed', value: c.confirmed ?? 0, hint: `${sum(confirmed, rsvpSeats)} seats secured`, filter: 'confirmed' },
  ] as const
})

// Bulk email (block screening only): payment and food; final emails stay one at a time in the sheet
const isBlockscreening = computed(() => event.value?.regPrefix === BLOCKSCREENING_REG_PREFIX)
const selected = computed(() => (rsvps.value ?? []).filter(r => selection.value[r.id]))
const resend = ref(false)

async function bulkEmail(kind: 'payment' | 'food', label: string) {
  const skipped = new Map<string, number>()
  const targets = selected.value.filter((r) => {
    const reason = bulkSkipReason(kind, r, resend.value)
    if (reason)
      skipped.set(reason, (skipped.get(reason) ?? 0) + 1)
    return !reason
  })
  const skipNote = [...skipped].map(([reason, n]) => `${n} ${reason}`).join(', ')
  if (!targets.length) {
    toast.add({ icon: 'ph:info', title: `No one to send the ${label} to`, description: `Skipped: ${skipNote}`, color: 'neutral' })
    return
  }

  const confirmed = await deleteConfirm.open({
    title: `Send ${label}`,
    description: `Send the ${label} to ${targets.length} ${targets.length === 1 ? 'person' : 'people'}?${skipNote ? ` Skipping ${skipNote}.` : ''}`,
    confirmLabel: `Send ${targets.length}`,
  })
  if (!confirmed)
    return

  try {
    const results = await $fetch<{ name: string, result: 'sent' | 'skipped' | 'failed', reason?: string }[]>(`/api/office/events/${id}/rsvps/bulk-email`, {
      method: 'POST',
      body: { kind, rsvpIds: targets.map(r => r.id), resend: resend.value },
    })
    const sent = results.filter(r => r.result === 'sent').length
    const failed = results.filter(r => r.result === 'failed')
    toast.add({
      icon: failed.length ? 'ph:warning-circle' : 'ph:paper-plane-tilt',
      title: `${label}: sent ${sent} of ${targets.length}`,
      description: failed.length ? `Failed: ${failed.map(f => `${f.name} (${f.reason})`).join('; ')}` : undefined,
      color: failed.length ? 'warning' : 'success',
      duration: failed.length ? 0 : undefined, // keep failures on screen until dismissed
    })
    selection.value = {}
  }
  catch (err) {
    const e = err as { data?: { statusMessage?: string }, message?: string }
    toast.add({ icon: 'ph:x-circle', title: 'Bulk email failed', description: e.data?.statusMessage ?? e.message ?? 'Something went wrong', color: 'error' })
  }
  finally {
    await refreshNuxtData(`event-${id}-rsvps`)
  }
}

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

        <!-- Appears once rows are ticked: count, clear, and the bulk actions as visible buttons -->
        <div v-if="selected.length" class="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-default bg-elevated/50 px-3 py-2">
          <p class="text-sm font-medium text-highlighted tabular-nums">
            {{ selected.length }} selected
          </p>
          <UButton
            label="Clear"
            color="neutral"
            variant="link"
            size="sm"
            class="px-0"
            @click="selection = {}"
          />
          <div class="flex flex-wrap items-center gap-2 sm:ml-auto">
            <UCheckbox v-model="resend" label="Include already sent" size="sm" />
            <UButton
              icon="ph:credit-card"
              label="Send payment email"
              color="neutral"
              variant="soft"
              size="sm"
              @click="bulkEmail('payment', 'payment email')"
            />
            <UButton icon="ph:bowl-food" label="Send food form" color="neutral" variant="soft" size="sm" @click="bulkEmail('food', 'food form')" />
          </div>
        </div>
        <OfficeEventRsvpTable
          v-if="rsvps"
          v-model:page="page"
          v-model:selection="selection"
          :selectable="isBlockscreening"
          :event="event"
          :rsvps="filtered"
          :empty="rsvps.length ? 'No registrations match your search or filter.' : 'No registrations yet.'"
        />
      </UCard>
    </template>
  </UDashboardPanel>
</template>
