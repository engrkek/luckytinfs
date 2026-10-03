<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v'

interface Entry {
  id: string
  amount: number
  createdAt: string
  label: string
  handle?: string
}

const PAGE_SIZE = 10

const { data } = await useFetch<{ donations: Entry[], expenses: Entry[], totals: { donations: number, expenses: number } }>('/api/reports')

// ponytail: search + paging run client-side over the full list; move to the API when rows reach the thousands
const ledgers = reactive([
  { key: 'donations' as const, title: 'Donations // In', empty: 'No donations yet. Be the first.', tilt: 'sm:rotate-1', q: '', page: 1 },
  { key: 'expenses' as const, title: 'Expenses // Out', empty: 'No expenses logged yet.', tilt: 'sm:-rotate-1', q: '', page: 1 },
])

const views = computed(() => ledgers.map((l) => {
  const all = data.value?.[l.key] ?? []
  const q = l.q.trim().toLowerCase()
  const found = q ? all.filter(e => `${e.label} ${e.handle ?? ''}`.toLowerCase().includes(q)) : all
  const pages = Math.max(1, Math.ceil(found.length / PAGE_SIZE))
  const page = Math.min(l.page, pages)
  return {
    count: all.length,
    total: data.value?.totals[l.key] ?? 0,
    rows: found.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    page,
    pages,
  }
}))

// Page swap only (keyed by page), so typing in search stays instant
const pageMotion = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.15, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.1, ease: 'easeOut' } },
} as const

function money(cents: number) {
  return `₱${(cents / 100).toLocaleString()}`
}

function short(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="grid sm:grid-cols-2 gap-8 sm:gap-6">
    <div v-for="(l, i) in ledgers" :key="l.key">
      <div class="max-w-sm w-full mx-auto bg-white text-neutral-900 font-type px-5 py-4 drop-shadow-md" :class="l.tilt">
        <div class="text-center uppercase">
          <h3 class="text-xs">
            Luckytin Fan Support
          </h3>
          <p class="font-bold">
            {{ l.title }}
          </p>
        </div>
        <USeparator type="dashed" class="my-2" :ui="{ border: 'border-neutral-900' }" />
        <template v-if="views[i]!.count">
          <input
            v-if="views[i]!.count > PAGE_SIZE"
            v-model="l.q"
            type="search"
            placeholder="Search…"
            :aria-label="`Search ${l.key}`"
            class="w-full mb-2 py-1 text-sm bg-transparent border-b border-dotted border-neutral-400 placeholder:text-neutral-400 outline-none focus-visible:border-solid focus-visible:border-neutral-900"
            @input="l.page = 1"
          >
          <AnimatePresence :initial="false" mode="wait">
            <motion.div v-if="views[i]!.rows.length" :key="views[i]!.page" class="grid grid-cols-1 gap-1.5" v-bind="pageMotion">
              <div v-for="e in views[i]!.rows" :key="e.id" class="flex items-baseline gap-1.5">
                <span class="shrink-0 text-xs text-neutral-500 uppercase">{{ short(e.createdAt) }}</span>
                <span class="min-w-0 grid">
                  <span class="text-sm truncate">{{ e.label }}</span>
                  <span v-if="e.handle" class="text-xs text-neutral-500 truncate">{{ e.handle }}</span>
                </span>
                <span class="flex-1 border-b border-dotted border-neutral-300 -translate-y-0.75" />
                <span class="shrink-0">{{ money(e.amount) }}</span>
              </div>
            </motion.div>
            <motion.p v-else key="none" class="text-sm text-neutral-500 text-center py-2" v-bind="pageMotion">
              No matches for “{{ l.q.trim() }}”.
            </motion.p>
          </AnimatePresence>
          <div v-if="views[i]!.pages > 1" class="flex items-center justify-between mt-2 text-xs uppercase">
            <button
              type="button"
              class="-mx-2 px-2 py-2 cursor-pointer transition-[scale] active:scale-96 disabled:text-neutral-300 disabled:cursor-default focus-visible:outline-1 focus-visible:outline-neutral-900"
              :disabled="views[i]!.page <= 1"
              @click="l.page = views[i]!.page - 1"
            >
              &lt; Prev
            </button>
            <span class="text-neutral-500" aria-live="polite">{{ views[i]!.page }} / {{ views[i]!.pages }}</span>
            <button
              type="button"
              class="-mx-2 px-2 py-2 cursor-pointer transition-[scale] active:scale-96 disabled:text-neutral-300 disabled:cursor-default focus-visible:outline-1 focus-visible:outline-neutral-900"
              :disabled="views[i]!.page >= views[i]!.pages"
              @click="l.page = views[i]!.page + 1"
            >
              Next &gt;
            </button>
          </div>
        </template>
        <p v-else class="text-sm text-neutral-500 text-center py-2">
          {{ l.empty }}
        </p>
        <USeparator type="dashed" class="my-2" :ui="{ border: 'border-neutral-900' }" />
        <div class="flex items-baseline justify-between font-bold">
          <span class="uppercase">Total</span>
          <span>{{ money(views[i]!.total) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
