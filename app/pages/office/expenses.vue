<script setup lang="ts">
import type { OfficeExpense } from '#shared/expenses'
import type { Channel } from '#shared/types'
import { LazyOfficeExpenseForm } from '#components'
import { php } from '#shared/blockscreening'

useHead({ title: 'Expenses' })

const overlay = useOverlay()
const expenseForm = overlay.create(LazyOfficeExpenseForm)

const { data } = useFetch<{ expenses: OfficeExpense[], balances: Record<string, { in: number, out: number }> }>('/api/office/expenses', { key: 'office-expenses' })
const { data: channels } = useFetch<Channel[]>('/api/office/channels', { key: 'office-channels' })

// Every wallet (even untouched ones) plus cash; '' is the cash key from the API
const wallets = computed(() => {
  const balances = data.value?.balances ?? {}
  return [
    ...(channels.value ?? []).map(c => ({ id: c.id, label: c.nickname || c.type, in: 0, out: 0, ...balances[c.id] })),
    { id: '', label: 'Cash', in: 0, out: 0, ...balances[''] },
  ]
})
</script>

<template>
  <UDashboardPanel id="expenses">
    <template #body>
      <div class="flex items-end">
        <div>
          <h1 class="font-display text-3xl tracking-tighter">
            Expenses
          </h1>
          <p class="text-muted">
            Track spending against each wallet.
          </p>
        </div>
        <div class="ml-auto">
          <UButton
            icon="ph:plus"
            label="Add expense"
            color="secondary"
            size="lg"
            @click="expenseForm.open({})"
          />
        </div>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <UCard v-for="w in wallets" :key="w.id" :ui="{ body: 'p-4 sm:p-4' }">
          <p class="text-sm text-muted truncate">
            {{ w.label }}
          </p>
          <template v-if="w.id">
            <p class="text-2xl font-semibold tabular-nums" :class="{ 'text-error': w.in - w.out < 0 }">
              {{ php(w.in - w.out) }}
            </p>
            <p class="text-xs text-muted tabular-nums">
              {{ php(w.in) }} in · {{ php(w.out) }} out
            </p>
          </template>
          <template v-else>
            <p class="text-2xl font-semibold tabular-nums">
              {{ php(w.out) }}
            </p>
            <p class="text-xs text-muted">
              spent out of pocket
            </p>
          </template>
        </UCard>
      </div>

      <UCard :ui="{ body: 'p-0 lg:p-0' }">
        <OfficeExpenseTable v-if="data" :expenses="data.expenses" />
      </UCard>
    </template>
  </UDashboardPanel>
</template>
