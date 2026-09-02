<script setup lang="ts">
const props = withDefaults(defineProps<{
  image: { src: string, alt: string, class?: any }
  caption?: string
  index?: number
  padding?: string
  class?: any
}>(), { padding: 'p-3' })
</script>

<template>
  <div
    class="bg-white flex flex-col drop-shadow-2xl transition-transform duration-300 ease-in-out hover:scale-105 hover:rotate-0 hover:z-10"
    :class="[
      index != null && (index % 2 === 0 ? '-rotate-5' : 'rotate-5'),
      index != null && (index % 2 === 0 ? 'hover:-translate-x-4' : 'hover:translate-x-4'),
      padding,
    ]"
  >
    <div class="overflow-hidden" :class="props.class">
      <NuxtImg
        :src="image.src"
        :alt="image.alt"
        draggable="false"
        class="w-full h-full object-cover"
        :class="image.class"
      />
    </div>
    <span v-if="caption" class="text lg:text-xl text-black font-hand font-bold text-center mt-2">
      {{ caption }}
    </span>
  </div>
</template>
