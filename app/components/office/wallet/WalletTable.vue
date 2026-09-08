<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Channel } from '#shared/types'
import { LazyAppDialog, LazyOfficeWalletForm, UButton } from '#components'

const props = defineProps<{ channels: Channel[] }>()

const overlay = useOverlay()
const walletForm = overlay.create(LazyOfficeWalletForm)
const deleteConfirm = overlay.create(LazyAppDialog)
const toast = useToast()

async function onDelete(e: Event, row: Channel) {
  e.stopPropagation()
  const confirmed = await deleteConfirm.open({
    title: 'Delete wallet',
    description: `This will permanently delete "${row.nickname || row.type}". This cannot be undone.`,
    confirmLabel: 'Delete',
    color: 'error',
  })
  if (!confirmed)
    return

  try {
    await $fetch(`/api/office/channels/${row.id}`, { method: 'DELETE' })
    await refreshNuxtData('office-channels')
  }
  catch (err) {
    const e2 = err as { data?: { statusMessage?: string }, message?: string }
    toast.add({
      icon: 'ph:x-circle',
      title: 'Delete failed',
      description: e2.data?.statusMessage ?? e2.message ?? 'Something went wrong',
      color: 'error',
    })
  }
}

const columns: TableColumn<Channel>[] = [
  sortableColumn<Channel>('type', 'Type'),
  { accessorKey: 'nickname', header: 'Nickname' },
  { accessorKey: 'accountName', header: 'Account Name' },
  { accessorKey: 'accountIdentifier', header: 'Account Number / Handle' },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => h('div', { class: 'flex items-center gap-1' }, [
      h(UButton, {
        icon: 'ph:pencil',
        color: 'neutral',
        variant: 'ghost',
        size: 'sm',
        onClick: (e: Event) => {
          e.stopPropagation()
          walletForm.open({ type: 'edit', channel: row.original })
        },
      }),
      h(UButton, {
        icon: 'ph:trash',
        color: 'error',
        variant: 'ghost',
        size: 'sm',
        onClick: (e: Event) => onDelete(e, row.original),
      }),
    ]),
  },
]
</script>

<template>
  <div class="border-t border-default">
    <UTable :data="props.channels" :columns empty="No wallets yet." />
  </div>
</template>
