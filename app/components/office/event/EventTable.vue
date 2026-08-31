<script setup lang="ts">
import type { TableColumn, TableRow } from '@nuxt/ui'
import type { CEvent } from '#shared/types'

defineProps<{ events: CEvent[] }>()

const UButton = resolveComponent('UButton')

function sortableColumn(accessorKey: keyof CEvent, label: string): TableColumn<CEvent> {
  return {
    accessorKey,
    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        variant: 'link',
        label,
        trailingIcon: isSorted
          ? isSorted === 'asc'
            ? 'ph:arrow-up'
            : 'ph:arrow-down'
          : 'ph:arrows-down-up',
        size: 'sm',
        ui: {
          trailingIcon: 'ml-auto',
        },
        class: 'w-full font-bold',
        onClick: () => column.toggleSorting(),
      })
    },
  }
}

const columns: TableColumn<CEvent>[] = [
  {
    ...sortableColumn('name', 'Name'),
  },
  sortableColumn('capacity', 'Capacity'),
]

function onSelect(e: Event, row: TableRow<CEvent>) {
  navigateTo(`/office/events/${row.original.id}`)
}
</script>

<template>
  <div class="border-t border-default">
    <UTable :data="events" :columns empty="No events yet." @select="onSelect">
      <template #name-cell="{ row }">
        <p class="font-bold text-highlighted">
          {{ row.original.name }}
        </p>
        <p class="text-muted">
          {{ row.original.venue }}
        </p>
      </template>
    </UTable>
  </div>
</template>
