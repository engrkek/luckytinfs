<script setup lang="ts">
useHead({ title: 'Home' })

const { donations } = useOfficeDonations()
const { letters } = useOfficeLetters()

const pending = computed(() => donations.value.filter(d => d.status === 'pending'))
const recentPending = computed(() => pending.value.slice(0, 5))

// ponytail: stats computed off the queues already in cache — no /stats endpoint.
// Add one when the tables get big enough that shipping every row hurts.
const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 })

const stats = computed(() => {
  const approved = donations.value.filter(d => d.status === 'approved')
  const raised = approved.reduce((sum, d) => sum + d.amount, 0) / 100
  return [
    { label: 'Raised', value: peso.format(raised), hint: `${approved.length} approved`, to: '/office/donations' },
    { label: 'Donations pending', value: pending.value.length, hint: 'awaiting review', to: '/office/donations' },
    { label: 'Letters pending', value: letters.value.filter(l => l.status === 'pending').length, hint: 'awaiting review', to: '/office/letters' },
    { label: 'Donors', value: new Set(approved.map(d => d.donor.email)).size, hint: 'unique, approved', to: '/office/donations' },
  ]
})
</script>

<template>
  <UDashboardPanel id="home">
    <template #body>
      <div class="flex items-baseline justify-between">
        <div>
          <h1 class="font-display text-3xl tracking-tighter">
            Home
          </h1>
          <p class="text-muted">
            {{ pending.length ? `${pending.length} donation${pending.length === 1 ? '' : 's'} awaiting review.` : 'All donations reviewed.' }}
          </p>
        </div>
        <UButton to="/office/donations" variant="link" trailing-icon="ph:arrow-right">
          View all donations
        </UButton>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <UPageCard
          v-for="stat in stats"
          :key="stat.label"
          :to="stat.to"
          variant="subtle"
          :ui="{ container: 'gap-1' }"
        >
          <p class="text-muted text-sm">
            {{ stat.label }}
          </p>
          <p class="font-display text-3xl tracking-tighter">
            {{ stat.value }}
          </p>
          <p class="text-dimmed text-xs">
            {{ stat.hint }}
          </p>
        </UPageCard>
      </div>

      <UCard :ui="{ body: 'p-0 lg:p-0' }">
        <OfficeDonationTable :donations="recentPending" />
      </UCard>
    </template>
  </UDashboardPanel>
</template>
