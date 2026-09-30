<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { OfficeExpense } from '#shared/expenses'
import { LazyAppDialog, LazyOfficeExpenseForm, UButton } from '#components'
import { php } from '#shared/blockscreening'

const props = defineProps<{ expenses: OfficeExpense[] }>()

const overlay = useOverlay()
const expenseForm = overlay.create(LazyOfficeExpenseForm)
const deleteConfirm = overlay.create(LazyAppDialog)
const toast = useToast()

async function onDelete(row: OfficeExpense) {
  const confirmed = await deleteConfirm.open({
    title: 'Delete expense',
    description: `This will permanently delete "${row.title}". This cannot be undone.`,
    confirmLabel: 'Delete',
    color: 'error',
  })
  if (!confirmed)
    return

  try {
    await $fetch(`/api/office/expenses/${row.id}`, { method: 'DELETE' })
    await refreshNuxtData('office-expenses')
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

const columns: TableColumn<OfficeExpense>[] = [
  {
    ...sortableColumn<OfficeExpense>('spentAt', 'Date'),
    cell: ({ row }) => new Date(row.original.spentAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
  },
  { accessorKey: 'title', header: 'Item' },
  {
    ...sortableColumn<OfficeExpense>('amount', 'Amount'),
    cell: ({ row }) => php(row.original.amount),
  },
  { id: 'wallet', header: 'Paid from', cell: ({ row }) => row.original.channelLabel ?? 'Cash' },
  { id: 'for', header: 'Spent on', cell: ({ row }) => row.original.campaignTitle ?? row.original.eventName ?? 'General' },
  {
    id: 'receipt',
    header: 'Receipt',
    cell: ({ row }) => row.original.receiptUrl
      ? h(UButton, { 'icon': 'ph:receipt', 'color': 'neutral', 'variant': 'ghost', 'size': 'sm', 'to': row.original.receiptUrl, 'target': '_blank', 'aria-label': 'View receipt' })
      : null,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => h('div', { class: 'flex items-center gap-1' }, [
      h(UButton, { 'icon': 'ph:pencil', 'color': 'neutral', 'variant': 'ghost', 'size': 'sm', 'aria-label': 'Edit', 'onClick': () => expenseForm.open({ expense: row.original }) }),
      h(UButton, { 'icon': 'ph:trash', 'color': 'error', 'variant': 'ghost', 'size': 'sm', 'aria-label': 'Delete', 'onClick': () => onDelete(row.original) }),
    ]),
  },
]
</script>

<template>
  <div class="border-t border-default">
    <UTable :data="props.expenses" :columns empty="No expenses yet." />
  </div>
</template>
