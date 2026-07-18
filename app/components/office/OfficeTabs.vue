<script setup lang="ts">
const tabs = [
  { icon: 'ph:star-four-fill', label: 'Home', to: '/office' },
  { icon: 'ph:folder', label: 'Projects', to: '/office/projects' },
  { icon: 'ph:heart', label: 'Donations', to: '/office/donations' },
  { icon: 'ph:receipt', label: 'Expenses', to: '/office/expenses' },
]

const moreTabs = [
  { icon: 'ph:grid-four', label: 'Expense Categories', to: '/office/categories' },
  { icon: 'ph:basket', label: 'Suppliers', to: '/office/suppliers' },
]

const moreOpen = ref(false)
</script>

<template>
  <div class="relative">
    <AnimatePresence>
      <motion
        v-if="moreOpen"
        class="absolute inset-x-0 -bottom-3 z-0 bg-secondary-950 border-t border-secondary-900 px-4 py-3"
        :initial="{ y: 0 }"
        :animate="{ y: '-100%' }"
        :exit="{ y: 0 }"
        :transition="{ duration: 0.2, ease: 'easeOut' }"
      >
        <UNavigationMenu
          :items="moreTabs"
          orientation="vertical"
        />
      </motion>
    </AnimatePresence>

    <div class="relative z-10 bg-secondary-950 text-primary-100 border-t border-secondary-900 flex items-center justify-around px-4 pt-3 pb-4">
      <NuxtLink
        v-for="(tab, index) in tabs"
        :key="index"
        :to="tab.to"
        class="flex flex-col items-center gap-1"
        active-class="text-primary-300"
      >
        <UIcon :name="tab.icon" class="size-6" />
        <p class="text-[11px] uppercase">{{ tab.label }}</p>
      </NuxtLink>
      <button class="flex flex-col items-center gap-1" @click="moreOpen = !moreOpen">
        <UIcon name="ph:dots-three" class="size-6" />
        <p class="text-[11px] uppercase">
          More
        </p>
      </button>
    </div>
  </div>
</template>
