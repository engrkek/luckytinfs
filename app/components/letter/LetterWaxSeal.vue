<script setup lang="ts">
import { sealSrc } from '#shared/letters/visuals'

const props = withDefaults(defineProps<{
  sealId: string
  size?: 'sm' | 'md' | 'lg'
}>(), {
  size: 'md',
})

const src = computed(() => sealSrc(props.sealId))

const sizeClass = computed(() => ({
  sm: 'w-10 h-10',
  md: 'w-[3.5rem] h-[3.5rem]',
  lg: 'w-16 h-16',
}[props.size]))
</script>

<template>
  <span
    class="letter-seal-img inline-grid place-items-center"
    :class="sizeClass"
    :aria-label="`Wax seal: ${sealId}`"
    role="img"
  >
    <img
      v-if="src"
      :src="src"
      alt=""
      draggable="false"
      class="block size-full object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)] select-none"
    >
    <span
      v-else
      class="letter-seal size-full text-sm"
      aria-hidden="true"
    >◉</span>
  </span>
</template>
