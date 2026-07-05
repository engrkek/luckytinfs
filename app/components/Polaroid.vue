<script setup lang="ts">
withDefaults(defineProps<{
  image: {
    src: string
    alt: string
    class?: any
  }
  caption?: string
  index: number
  padding?: string
}>(), {
  padding: 'p-3',
})
</script>

<template>
  <div
    class="bg-white flex flex-col drop-shadow-2xl transition-transform duration-300 ease-in-out hover:scale-105 hover:rotate-0 hover:z-10"
    :class="[
      index % 2 === 0 ? '-rotate-5' : 'rotate-5',
      index % 2 === 0 ? 'hover:-translate-x-4' : 'hover:translate-x-4',
      padding,
    ]"
  >
    <NuxtImg
      :src="image.src"
      :alt="image.alt"
      draggable="false"
      class="object-cover"
      :class="image.class"
    />
    <span v-if="caption" class="text-xs text-black font-hand text-center mt-2">
      {{ caption }}
    </span>
  </div>
</template>
