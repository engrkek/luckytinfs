<script setup lang="ts">
import type { DonationStatus } from '#shared/donations'
import { LazyOfficeDonationForm } from '#components'

useHead({ title: 'Donations' })

const { donations } = useOfficeDonations()

const overlay = useOverlay()
const donationForm = overlay.create(LazyOfficeDonationForm)

const search = ref('')
const statusFilter = ref<DonationStatus | 'all'>('all')

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

        <div class="ml-auto flex">
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

        <OfficeDonationTable :donations="donations" />
      </UCard>
    </template>
  </UDashboardPanel>
</template>
