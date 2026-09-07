<script setup lang="ts">
import type { DonationStatus } from '#shared/donations'

useHead({ title: 'Donations' })

const { donations } = useOfficeDonations()

const search = ref('')
const statusFilter = ref<DonationStatus | 'all'>('pending')

const statusItems = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'invalid', label: 'Invalid' },
]

const filtered = computed(() => donations.value.filter((d) => {
  if (statusFilter.value !== 'all' && d.status !== statusFilter.value)
    return false
  const q = search.value.trim().toLowerCase()
  if (q && !`${d.donor.name} ${d.donor.handle}`.toLowerCase().includes(q))
    return false
  return true
}))
</script>

<template>
  <UDashboardPanel id="donations">
    <template #body>
      <div class="flex">
        <div>
          <h1 class="font-display text-3xl tracking-tighter">
            Donations
          </h1>
          <p class="text-muted">
            Review and verify incoming donations.
          </p>
        </div>
      </div>

      <UCard :ui="{ body: 'p-0 lg:p-0' }">
        <div class="flex flex-wrap items-center gap-2 p-3">
          <UInput v-model="search" icon="ph:magnifying-glass" placeholder="Search donors..." class="flex-1 min-w-60 lg:max-w-60" />
          <USelect v-model="statusFilter" :items="statusItems" value-key="value" class="lg:ml-auto" />
        </div>

        <OfficeDonationTable :donations="filtered" />
      </UCard>
    </template>
  </UDashboardPanel>
</template>
