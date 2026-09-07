<script setup lang="ts">
interface Entry {
  id: string
  amount: number
  createdAt: string
  label: string
}

const { data } = await useFetch<{ donations: Entry[], expenses: Entry[] }>('/api/reports')

const donations = computed(() => data.value?.donations ?? [])
const expenses = computed(() => data.value?.expenses ?? [])
const totalIn = computed(() => donations.value.reduce((sum, d) => sum + d.amount, 0))
const totalOut = computed(() => expenses.value.reduce((sum, e) => sum + e.amount, 0))

function money(cents: number) {
  return `₱${(cents / 100).toLocaleString()}`
}

function short(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="grid sm:grid-cols-2 gap-8 sm:gap-6">
    <div class="max-w-sm w-full mx-auto sm:rotate-1 bg-white text-neutral-900 font-type px-5 py-4 drop-shadow-md">
      <div class="text-center uppercase">
        <h3 class="text-xs">
          Luckytin Fan Support
        </h3>
        <p class="text-sm font-bold">
          Donations // Income
        </p>
      </div>

      <USeparator type="dashed" class="my-2" :ui="{ border: 'border-neutral-900' }" />

      <div v-if="donations.length" class="grid gap-1.5 text-sm">
        <div v-for="d in donations" :key="d.id" class="flex items-baseline gap-1.5">
          <span class="shrink-0 text-neutral-500">{{ short(d.createdAt) }}</span>
          <span class="truncate">{{ d.label }}</span>
          <span class="flex-1 border-b border-dotted border-neutral-300 -translate-y-0.75" />
          <span class="shrink-0">{{ money(d.amount) }}</span>
        </div>
      </div>
      <p v-else class="text-sm text-neutral-500 text-center py-2">
        No donations yet — be the first.
      </p>

      <USeparator type="dashed" class="my-2" :ui="{ border: 'border-neutral-900' }" />

      <div class="flex items-baseline justify-between text-sm font-bold">
        <span>Total</span>
        <span>{{ money(totalIn) }}</span>
      </div>
    </div>

    <div class="max-w-sm w-full mx-auto sm:-rotate-1 bg-white text-neutral-900 font-type px-5 py-4 drop-shadow-md">
      <div class="text-center uppercase">
        <h3 class="text-xs">
          Luckytin Fan Support
        </h3>
        <p class="text-sm font-bold">
          Expenses // Out
        </p>
      </div>

      <USeparator type="dashed" class="my-2" :ui="{ border: 'border-neutral-900' }" />

      <div v-if="expenses.length" class="grid gap-1.5 text-sm">
        <div v-for="e in expenses" :key="e.id" class="flex items-baseline gap-1.5">
          <span class="shrink-0 text-neutral-500">{{ short(e.createdAt) }}</span>
          <span class="truncate">{{ e.label }}</span>
          <span class="flex-1 border-b border-dotted border-neutral-300 -translate-y-0.75" />
          <span class="shrink-0">{{ money(e.amount) }}</span>
        </div>
      </div>
      <p v-else class="text-sm text-neutral-500 text-center py-2">
        No expenses logged yet.
      </p>

      <USeparator type="dashed" class="my-2" :ui="{ border: 'border-neutral-900' }" />

      <div class="flex items-baseline justify-between text-sm font-bold">
        <span>Total</span>
        <span>{{ money(totalOut) }}</span>
      </div>
    </div>
  </div>
</template>
