<script setup lang="ts">
import type { DonationStatus } from '#shared/donations'
import { LazyOfficeDonationForm } from '#components'

useHead({ title: 'Donations' })

const { donations } = useOfficeDonations()

const overlay = useOverlay()
const donationForm = overlay.create(LazyOfficeDonationForm)

const search = ref('')
const statusFilter = ref<DonationStatus | 'all'>('all')

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return donations.value.filter(d =>
    (statusFilter.value === 'all' || d.status === statusFilter.value)
    && (!q || [d.donor.name, d.donor.handle, d.donor.email, d.refNo].some(v => v?.toLowerCase().includes(q))),
  )
})

function exportCsv() {
  downloadCsv(csvFilename('donations'), filtered.value, {
    'Date': d => csvDate(d.createdAt),
    'Donor': d => d.donor.name,
    'Handle': d => d.donor.handle,
    'Social': d => d.donor.social,
    'Email': d => d.donor.email,
    'Amount': d => d.amount / 100,
    'Campaign': d => d.campaignTitle ?? 'General',
    'Channel': d => d.channelLabel,
    'Reference no.': d => d.refNo,
    'Status': d => d.status,
    'Credit as': d => d.display,
    'Reviewed by': d => d.reviewer?.name,
    'Donor notes': d => d.donorNotes,
    'Admin notes': d => d.adminNotes,
  })
}

const statusItems = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'invalid', label: 'Invalid' },
]
</script>

<template>
  <UDashboardPanel id="donations">
    <template #body>
      <div class="flex items-end">
        <div>
          <h1 class="font-display text-3xl tracking-tighter">
            Donations
          </h1>
          <p class="text-muted">
            Review and verify incoming donations.
          </p>
        </div>

        <div class="ml-auto flex gap-2">
          <UButton
            label="Export CSV"
            icon="ph:download-simple"
            color="neutral"
            variant="soft"
            size="lg"
            :disabled="!filtered.length"
            @click="exportCsv"
          />
          <UButton
            label="Add donation"
            icon="ph:plus"
            color="secondary"
            size="lg"
            @click="donationForm.open({})"
          />
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
