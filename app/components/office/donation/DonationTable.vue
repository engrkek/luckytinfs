<script setup lang="ts">
import type { TableColumn, TableRow } from '@nuxt/ui'
import type { OfficeDonation } from '~/composables/useOfficeDonations'
import { LazyAppDialog, LazyOfficeDonationForm, LazyOfficeDonationSheet, UBadge, UButton, UChip } from '#components'

defineProps<{ donations: OfficeDonation[] }>()

const overlay = useOverlay()
const donationSheet = overlay.create(LazyOfficeDonationSheet)
const donationForm = overlay.create(LazyOfficeDonationForm)
const deleteConfirm = overlay.create(LazyAppDialog)

const { mutate: deleteDonation } = useDeleteOfficeDonation()

async function onDelete(e: Event, row: OfficeDonation) {
  e.stopPropagation()
  const confirmed = await deleteConfirm.open({
    title: 'Delete donation',
    description: `This will permanently delete ${row.donor.name}'s ${money(row.amount)} donation. This cannot be undone.`,
    confirmLabel: 'Delete',
    color: 'error',
  })
  if (confirmed)
    deleteDonation({ id: row.id })
}

const platforms = {
  x: 'ph:x-logo',
  instagram: 'ph:instagram-logo',
  facebook: 'ph:facebook-logo',
  tiktok: 'ph:tiktok-logo',
  reddit: 'ph:reddit-logo',
  threads: 'ph:threads-logo',
} as const

const statuses = {
  pending: 'warning',
  approved: 'success',
  invalid: 'error',
} as const

function money(cents: number) {
  return `₱${(cents / 100).toLocaleString()}`
}

const columns: TableColumn<OfficeDonation>[] = [
  {
    accessorKey: 'donor',
    header: 'Donor',
  },
  {
    ...sortableColumn<OfficeDonation>('amount', 'Amount'),
  },
  {
    accessorKey: 'campaignTitle',
    header: 'Campaign',
  },
  {
    accessorKey: 'refNo',
    header: 'Ref No',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => h(UBadge, {
      label: row.original.status,
      color: statuses[row.original.status],
      variant: 'soft',
      class: 'capitalize',
    }, {
      leading: () => h(UChip, {
        standalone: true,
        inset: true,
        color: statuses[row.original.status],
      }),
    }),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      return h('div', { class: 'flex items-center gap-1' }, [
        h(UButton, {
          icon: 'ph:pencil',
          color: 'neutral',
          variant: 'ghost',
          size: 'sm',
          onClick: (e: Event) => {
            e.stopPropagation()
            donationForm.open({ donation: row.original })
          },
        }),
        h(UButton, {
          icon: 'ph:trash',
          color: 'error',
          variant: 'ghost',
          size: 'sm',
          onClick: (e: Event) => onDelete(e, row.original),
        }),
      ])
    },
  },
]

function onSelect(e: Event, row: TableRow<OfficeDonation>) {
  donationSheet.open({ donation: row.original })
}
</script>

<template>
  <div class="border-t border-default">
    <UTable
      :data="donations"
      :columns
      empty="No donations yet."
      @select="onSelect"
    >
      <template #donor-cell="{ row }">
        <div class="flex items-center gap-2">
          <UAvatar :alt="row.original.donor.name" />
          <div>
            <p class="text-highlighted font-bold">
              {{ row.original.donor.name }}
            </p>
            <div class="flex items-center gap-1">
              <UIcon :name="platforms[row.original.donor.social as keyof typeof platforms] ?? 'ph:link'" />
              <p>@{{ row.original.donor.handle.replace(/^@/, '') }}</p>
            </div>
          </div>
        </div>
      </template>

      <template #amount-cell="{ row }">
        <span class="font-mono font-bold text-highlighted">{{ money(row.original.amount) }}</span>
      </template>

      <template #campaignTitle-cell="{ row }">
        {{ row.original.campaignTitle ?? 'Wherever it\'s needed most' }}
      </template>

      <template #refNo-cell="{ row }">
        <span :class="row.original.refNo ? 'font-mono' : 'text-muted'">{{ row.original.refNo || '—' }}</span>
      </template>
    </UTable>
  </div>
</template>
