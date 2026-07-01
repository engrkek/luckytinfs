<script setup lang="ts">
defineProps<{
  image: {
    src: string
    alt: string
  }
  caption?: string
  index: number
  size?: any
}>()
</script>

<template>
  <div
    class="bg-white p-2 flex flex-col drop-shadow-2xl transition-transform duration-300 ease-in-out hover:scale-105 hover:rotate-0 hover:z-10"
    :class="[
      index % 2 === 0 ? '-rotate-5' : 'rotate-5',
      index % 2 === 0 ? 'hover:-translate-x-4' : 'hover:translate-x-4',
    ]"
  >
    <NuxtImg
      :src="image.src"
      :alt="image.alt"
      class="object-cover"
      :class="size ? size : 'size-32'"
    />
    <span v-if="caption" class="w-32 text-xs text-black font-hand text-center mt-2">
      {{ caption }}
    </span>
  </div>
</template>
