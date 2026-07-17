<script setup lang="ts">
const tabs = [
  { icon: 'ph:star-four-fill', label: 'Home', to: '/office' },
  { icon: 'ph:folder', label: 'Projects', to: '/office/projects' },
  { icon: 'ph:heart', label: 'Donations', to: '/office/donations' },
  { icon: 'ph:receipt', label: 'Expenses', to: '/office/expenses' },
]

const moreTabs = [
  { icon: 'ph:star-four-fill', label: 'Home', to: '/office' },
]

const moreOpen = ref(false)
</script>

<template>
  <div class="relative bg-secondary-950 text-primary-100 border-t border-secondary-900 flex items-center justify-around px-4 pt-3 pb-4">
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

    <div
      v-if="moreOpen"
      class="fixed inset-0 -z-40 bg-secondary-950/75"
      @click="moreOpen = false"
    />
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-full"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="translate-y-full"
    >
      <div
        v-if="moreOpen"
        class="absolute inset-x-0 bottom-full z-50 bg-secondary-900 ring ring-secondary-950 rounded-t-xl"
        @click="moreOpen = false"
      >
        <UNavigationMenu :items="moreTabs" orientation="vertical" class="p-2" />
      </div>
    </Transition>
  </div>
</template>
