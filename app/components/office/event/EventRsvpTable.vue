<script setup lang="ts">
import type { TableColumn, TableRow } from '@nuxt/ui'
import type { CEvent, EventRsvp } from '#shared/types'
import { LazyOfficeEventRsvpForm, LazyOfficeEventRsvpSheet, UBadge, UButton, UChip } from '#components'

const props = defineProps<{ event: CEvent, rsvps: EventRsvp[] }>()

const overlay = useOverlay()
const eventRsvpSheet = overlay.create(LazyOfficeEventRsvpSheet)
const eventRsvpForm = overlay.create(LazyOfficeEventRsvpForm)

const platforms = {
  x: 'ph:x-logo',
  facebook: 'ph:facebook-logo',
  tiktok: 'ph:tiktok-logo',
  threads: 'ph:threads-logo',
} as const

const statuses = {
  for_review: 'info',
  approved: 'success',
  confirmed: 'primary',
  invalid: 'error',
} as const

const columns: TableColumn<EventRsvp>[] = [
  {
    ...sortableColumn<EventRsvp>('fullName', 'Name'),
  },
  {
    accessorKey: 'email',
    header: 'Contact',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      return h('div', { class: 'flex items-center gap-1' }, [
        h(UChip, {
          standalone: true,
          inset: true,
          color: statuses[row.original.status as keyof typeof statuses],
        }),
        h(UBadge, {
          label: row.original.status,
          color: statuses[row.original.status as keyof typeof statuses],
          variant: 'soft',
          class: 'capitalize',
        }),
      ])
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      return h('div', { class: 'flex items-center gap-2' }, [
        h(UButton, {
          icon: 'ph:pencil',
          color: 'neutral',
          variant: 'ghost',
          size: 'sm',
          onClick: (e: Event) => {
            e.stopPropagation()
            eventRsvpForm.open({ type: 'edit', event: props.event, rsvp: row.original })
          },
        }),
      ])
    },
  },
]

function onSelect(e: Event, row: TableRow<EventRsvp>) {
  eventRsvpSheet.open({ rsvp: row.original })
}
</script>

<template>
  <div class="border-t border-default">
    <UTable
      :data="rsvps"
      :columns
      empty="No registrations yet."
      @select="onSelect"
    >
      <template #fullName-cell="{ row }">
        <div class="flex items-center gap-2">
          <UAvatar :alt="row.original.fullName" />
          <div>
            <p class="text-highlighted font-bold">
              {{ row.original.fullName }} ({{ row.original.nickname }})
            </p>
            <div class="flex items-center gap-1">
              <UIcon :name="platforms[row.original.socialPlatform as keyof typeof platforms] ?? 'ph:link'" />
              <p>{{ row.original.socialHandle }}</p>
            </div>
          </div>
        </div>
      </template>

      <template #email-cell="{ row }">
        <div class="flex items-center gap-1">
          <UIcon name="ph:envelope" />
          <p>{{ row.original.email }}</p>
        </div>
        <div class="flex items-center gap-1">
          <UIcon name="ph:phone" />
          <p>{{ row.original.contactNumber }}</p>
        </div>
      </template>
    </UTable>
  </div>
</template>
