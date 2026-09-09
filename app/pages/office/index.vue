<script setup lang="ts">
useHead({ title: 'Home' })

const { donations } = useOfficeDonations()

const pending = computed(() => donations.value.filter(d => d.status === 'pending'))
const recentPending = computed(() => pending.value.slice(0, 5))
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

      <UCard :ui="{ body: 'p-0 lg:p-0' }">
        <OfficeDonationTable :donations="recentPending" />
      </UCard>
    </template>
  </UDashboardPanel>
</template>
