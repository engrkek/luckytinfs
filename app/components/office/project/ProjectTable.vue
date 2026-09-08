<script setup lang="ts">
import type { TableColumn, TableRow } from '@nuxt/ui'
import type { Campaign } from '#shared/types'

defineProps<{ projects: Campaign[] }>()

const columns: TableColumn<Campaign>[] = [
  sortableColumn<Campaign>('title', 'Title'),
  sortableColumn<Campaign>('status', 'Status'),
  sortableColumn<Campaign>('startDate', 'Start Date'),
  sortableColumn<Campaign>('endDate', 'End Date'),
]

function onSelect(e: Event, row: TableRow<Campaign>) {
  navigateTo(`/office/projects/${row.original.id}`)
}
</script>

<template>
  <div class="border-t border-default">
    <UTable :data="projects" :columns empty="No projects yet." @select="onSelect">
      <template #title-cell="{ row }">
        <p class="font-bold text-highlighted">
          {{ row.original.title }}
        </p>
      </template>
      <template #status-cell="{ row }">
        <UBadge :label="row.original.status" :color="row.original.status === 'open' ? 'success' : 'neutral'" variant="soft" class="capitalize" />
      </template>
      <template #startDate-cell="{ row }">
        {{ new Date(row.original.startDate).toLocaleDateString() }}
      </template>
      <template #endDate-cell="{ row }">
        {{ row.original.endDate ? new Date(row.original.endDate).toLocaleDateString() : '—' }}
      </template>
    </UTable>
  </div>
</template>
