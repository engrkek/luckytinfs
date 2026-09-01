import type { TableColumn } from '@nuxt/ui'
import { UButton } from '#components'

export function sortableColumn<T>(accessorKey: keyof T, label: string): TableColumn<T> {
  return {
    accessorKey: accessorKey as string,
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
        ui: {
          trailingIcon: 'ml-auto',
        },
        class: 'w-full font-bold',
        onClick: () => column.toggleSorting(),
      })
    },
  }
}
