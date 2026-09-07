<script setup lang="ts">
defineProps<{ isPending: boolean, hasResults: boolean }>()
defineEmits<{ export: [], refresh: [] }>()

const searchQuery = defineModel<string>('searchQuery', { required: true })
const platformFilter = defineModel<string>('platformFilter', { required: true })
const childFilter = defineModel<string>('childFilter', { required: true })
const paymentFilter = defineModel<string>('paymentFilter', { required: true })
</script>

<template>
  <section class="bg-secondary-950/50 backdrop-blur-md border border-primary-100/10 p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between">
    <!-- Interactive search/inputs left side -->
    <div class="w-full flex flex-col sm:flex-row flex-wrap gap-3 items-center flex-1">
      <!-- Text Search -->
      <div class="relative w-full sm:max-w-xs">
        <UInput
          v-model="searchQuery"
          placeholder="Search name, email, ref, handle..."
          size="md"
          icon="ph:magnifying-glass"
          class="w-full text-secondary-950 bg-white/5 border border-primary-100/10 rounded-lg text-sm"
        />
      </div>

      <!-- Payment Filter -->
      <div class="w-full sm:w-auto flex items-center gap-2">
        <span class="text-xs text-primary-200/50 shrink-0 font-medium uppercase tracking-wider">Payment:</span>
        <select
          v-model="paymentFilter"
          class="bg-secondary-950 text-primary-100 border border-primary-100/15 rounded-lg py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary-300"
        >
          <option value="all">
            All Statuses
          </option>
          <option value="paid">
            Paid Only 💳
          </option>
          <option value="unpaid">
            Pending Payment ⏳
          </option>
        </select>
      </div>

      <!-- Platform Filter -->
      <div class="w-full sm:w-auto flex items-center gap-2">
        <span class="text-xs text-primary-200/50 shrink-0 font-medium uppercase tracking-wider">Platform:</span>
        <select
          v-model="platformFilter"
          class="bg-secondary-950 text-primary-100 border border-primary-100/15 rounded-lg py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary-300"
        >
          <option value="all">
            All Platforms
          </option>
          <option value="X">
            X (Twitter)
          </option>
          <option value="Instagram">
            Instagram
          </option>
          <option value="Facebook">
            Facebook
          </option>
          <option value="TikTok">
            TikTok
          </option>
        </select>
      </div>

      <!-- Child Option Filter -->
      <div class="w-full sm:w-auto flex items-center gap-2">
        <span class="text-xs text-primary-200/50 shrink-0 font-medium uppercase tracking-wider">Seats:</span>
        <select
          v-model="childFilter"
          class="bg-secondary-950 text-primary-100 border border-primary-100/15 rounded-lg py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary-300"
        >
          <option value="all">
            All Inclusions
          </option>
          <option value="sponsor">
            Sponsor 1 Child 🐥
          </option>
          <option value="sponsor_two">
            Sponsor 2 Children 🐥🐥
          </option>
          <option value="bring">
            Bring Own Child 🎒
          </option>
        </select>
      </div>
    </div>

    <!-- Export CSV button on the right -->
    <div class="w-full md:w-auto flex justify-end gap-2 shrink-0">
      <UButton
        v-if="hasResults"
        size="md"
        icon="ph:download-simple"
        color="primary"
        class="w-full md:w-auto text-secondary-950"
        @click="$emit('export')"
      >
        Export CSV
      </UButton>
      <UButton
        size="md"
        icon="ph:arrow-clockwise"
        variant="outline"
        class="w-full md:w-auto"
        :loading="isPending"
        @click="$emit('refresh')"
      >
        Refresh
      </UButton>
    </div>
  </section>
</template>
