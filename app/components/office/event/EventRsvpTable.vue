<script setup lang="ts">
import type { TableColumn, TableRow } from '@nuxt/ui'
import type { CEvent, OfficeEventRsvp } from '#shared/types'
import { getPaginationRowModel } from '@tanstack/vue-table'
import { LazyOfficeEventRsvpForm, LazyOfficeEventRsvpSheet, UBadge, UButton, UChip } from '#components'
import { rsvpStatus } from '#shared/events'
import { formatSocial, socialIcon } from '#shared/social'

const props = withDefaults(defineProps<{ event: CEvent, rsvps: OfficeEventRsvp[], empty?: string }>(), {
  empty: 'No registrations yet.',
})

// 1-based page, owned by the parent so it can reset on search/filter
const page = defineModel<number>('page', { default: 1 })
const PAGE_SIZE = 20

const pagination = computed({
  get: () => ({ pageIndex: page.value - 1, pageSize: PAGE_SIZE }),
  set: v => page.value = v.pageIndex + 1,
})

const pageCount = computed(() => Math.max(Math.ceil(props.rsvps.length / PAGE_SIZE), 1))
// Deleting the last row on the last page would otherwise strand you on an empty page
watch(pageCount, (n) => {
  if (page.value > n)
    page.value = n
})

const range = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return `${start + 1}–${Math.min(start + PAGE_SIZE, props.rsvps.length)}`
})

const overlay = useOverlay()
const eventRsvpSheet = overlay.create(LazyOfficeEventRsvpSheet)
const eventRsvpForm = overlay.create(LazyOfficeEventRsvpForm)
const { remove } = useEventRsvpActions(() => props.event.id)

const columns: TableColumn<OfficeEventRsvp>[] = [
  {
    accessorKey: 'regId',
    header: 'Reg ID',
    cell: ({ row }) => h('div', { class: 'font-mono' }, row.original.regId),
  },
  {
    ...sortableColumn<OfficeEventRsvp>('fullName', 'Name'),
  },
  {
    accessorKey: 'email',
    header: 'Contact',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const { label, color } = rsvpStatus(row.original.status)
      return h(UBadge, { label, color, variant: 'soft' }, {
        leading: () => h(UChip, { standalone: true, inset: true, color }),
      })
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      return h('div', { class: 'flex items-center gap-2' }, [
        h(UButton, {
          'icon': 'ph:pencil',
          'aria-label': `Edit ${row.original.fullName}`,
          'color': 'neutral',
          'variant': 'ghost',
          'size': 'sm',
          'onClick': (e: Event) => {
            e.stopPropagation()
            eventRsvpForm.open({ type: 'edit', event: props.event, rsvp: row.original })
          },
        }),
        h(UButton, {
          'icon': 'ph:trash',
          'aria-label': `Delete ${row.original.fullName}`,
          'color': 'error',
          'variant': 'ghost',
          'size': 'sm',
          'onClick': (e: Event) => {
            e.stopPropagation()
            remove(row.original)
          },
        }),
      ])
    },
  },
]

function onSelect(e: Event, row: TableRow<OfficeEventRsvp>) {
  eventRsvpSheet.open({ event: props.event, rsvp: row.original })
}
</script>

<template>
  <div class="border-t border-default">
    <UTable
      v-model:pagination="pagination"
      :data="rsvps"
      :columns
      :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
      :empty
      @select="onSelect"
    >
      <template #fullName-cell="{ row }">
        <div class="flex items-center gap-2">
          <UAvatar :alt="row.original.fullName" />
          <div>
            <p class="text-highlighted font-bold">
              {{ row.original.fullName }} ({{ row.original.nickname }})
            </p>
            <div v-if="formatSocial(row.original.socialPlatform, row.original.socialHandle)" class="flex items-center gap-1 min-w-0">
              <UIcon :name="socialIcon(row.original.socialPlatform)" class="shrink-0" />
              <AppSocialHandle :social="formatSocial(row.original.socialPlatform, row.original.socialHandle)!" />
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

    <div v-if="rsvps.length" class="flex flex-wrap items-center justify-between gap-2 border-t border-default px-3 py-2.5">
      <p class="text-sm text-muted tabular-nums">
        Showing {{ range }} of {{ rsvps.length }}
      </p>
      <UPagination
        v-if="pageCount > 1"
        v-model:page="page"
        :items-per-page="PAGE_SIZE"
        :total="rsvps.length"
        size="sm"
        variant="ghost"
        active-variant="soft"
      />
    </div>
  </div>
</template>
