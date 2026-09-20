<script setup lang="ts">
const { officeNavPrimary, officeNavMore } = useOfficeNav()

const moreOpen = ref(false)
const moreActive = computed(() => officeNavMore.value.some(t => t.active))

// Close the sheet once navigation lands
const route = useRoute()
watch(() => route.path, () => {
  moreOpen.value = false
})
</script>

<template>
  <nav
    aria-label="Office"
    class="fixed bottom-0 inset-x-0 bg-muted border-t border-default pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
  >
    <ul class="flex items-stretch">
      <li v-for="tab in officeNavPrimary" :key="tab.to as string" class="flex-1">
        <NuxtLink
          :to="tab.to"
          :aria-current="tab.active ? 'page' : undefined"
          class="flex flex-col items-center justify-center gap-1 min-h-11 transition-colors duration-150"
          :class="tab.active ? 'text-primary-400' : 'text-muted'"
        >
          <UIcon :name="tab.active ? tab.activeIcon : tab.icon" class="text-xl" />
          <p class="text-[10px] uppercase">
            {{ tab.label }}
          </p>
        </NuxtLink>
      </li>

      <li class="flex-1">
        <button
          type="button"
          class="w-full flex flex-col items-center justify-center gap-1 min-h-11 transition-colors duration-150"
          :class="moreActive || moreOpen ? 'text-primary-400' : 'text-muted'"
          :aria-expanded="moreOpen"
          @click="moreOpen = true"
        >
          <UIcon :name="moreActive || moreOpen ? 'ph:dots-three-circle-fill' : 'ph:dots-three-circle'" class="text-xl" />
          <p class="text-[10px] uppercase">
            More
          </p>
        </button>
      </li>
    </ul>

    <UDrawer v-model:open="moreOpen" title="More">
      <template #body>
        <ul class="grid gap-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <li v-for="tab in officeNavMore" :key="tab.to as string">
            <NuxtLink
              :to="tab.to"
              :aria-current="tab.active ? 'page' : undefined"
              class="flex items-center gap-3 rounded-lg px-3 py-3 transition-colors duration-150"
              :class="tab.active ? 'bg-elevated text-primary-400' : 'text-toned hover:bg-elevated/50'"
            >
              <UIcon :name="tab.active ? tab.activeIcon : tab.icon" class="text-xl" />
              <span class="text-sm">{{ tab.label }}</span>
            </NuxtLink>
          </li>
        </ul>
      </template>
    </UDrawer>
  </nav>
</template>
