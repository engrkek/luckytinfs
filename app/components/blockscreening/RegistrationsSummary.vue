<script setup lang="ts">
defineProps<{
  totalSlots: number
  filteredTotalSlots: number
  paidSlotsCount: number
  filteredPaidCount: number
  collectedRevenue: number
  unpaidSlotsCount: number
  sponsoredKidsCount: number
  filteredSponsoredKidsCount: number
  isFiltered: boolean
}>()
</script>

<template>
  <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Card 1: Total Registered -->
    <div class="bg-secondary-950/60 backdrop-blur-md border border-primary-100/10 p-5 rounded-2xl flex items-center gap-4 shadow-lg">
      <div class="size-12 rounded-xl bg-primary-100/10 flex items-center justify-center text-2xl text-primary-300">
        🎟️
      </div>
      <div class="space-y-0.5">
        <p class="text-xs uppercase tracking-wider text-primary-200/50 font-medium">
          Total Registered
        </p>
        <div class="flex items-baseline gap-1.5">
          <span class="text-2xl font-bold font-mono text-primary-100">{{ totalSlots }}</span>
          <span v-if="isFiltered" class="text-xs text-primary-300/80">
            ({{ filteredTotalSlots }} filtered)
          </span>
        </div>
      </div>
    </div>

    <!-- Card 2: Paid Slots & Collected Revenue -->
    <div class="bg-secondary-950/60 backdrop-blur-md border border-emerald-500/20 p-5 rounded-2xl flex items-center gap-4 shadow-lg">
      <div class="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-2xl text-emerald-400">
        💳
      </div>
      <div class="space-y-0.5">
        <p class="text-xs uppercase tracking-wider text-emerald-300/70 font-medium">
          Paid Slots (Collected)
        </p>
        <div class="flex items-baseline gap-1.5">
          <span class="text-2xl font-bold font-mono text-emerald-300">{{ paidSlotsCount }}</span>
          <span v-if="isFiltered" class="text-xs text-emerald-300/80">
            ({{ filteredPaidCount }} filtered)
          </span>
          <span class="text-xs text-emerald-400/80 font-mono">
            (₱{{ collectedRevenue.toLocaleString() }})
          </span>
        </div>
      </div>
    </div>

    <!-- Card 3: Pending Payments -->
    <div class="bg-secondary-950/60 backdrop-blur-md border border-rose-500/20 p-5 rounded-2xl flex items-center gap-4 shadow-lg">
      <div class="size-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-2xl text-rose-400">
        ⏳
      </div>
      <div class="space-y-0.5">
        <p class="text-xs uppercase tracking-wider text-rose-300/70 font-medium">
          Pending Payment
        </p>
        <div class="flex items-baseline gap-1.5">
          <span class="text-2xl font-bold font-mono text-rose-300">{{ unpaidSlotsCount }}</span>
          <span class="text-xs text-rose-300/60">
            attendees
          </span>
        </div>
      </div>
    </div>

    <!-- Card 4: Sponsoring Charity Kids -->
    <div class="bg-secondary-950/60 backdrop-blur-md border border-primary-100/10 p-5 rounded-2xl flex items-center gap-4 shadow-lg">
      <div class="size-12 rounded-xl bg-primary-100/10 flex items-center justify-center text-2xl text-primary-300">
        🐥
      </div>
      <div class="space-y-0.5">
        <p class="text-xs uppercase tracking-wider text-primary-200/50 font-medium">
          Bahay Tuluyan Kids
        </p>
        <div class="flex items-baseline gap-1.5">
          <span class="text-2xl font-bold font-mono text-primary-100">{{ sponsoredKidsCount }}</span>
          <span v-if="isFiltered" class="text-xs text-primary-300/80">
            ({{ filteredSponsoredKidsCount }} filtered)
          </span>
          <span class="text-xs text-primary-300/70">
            sponsored
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
