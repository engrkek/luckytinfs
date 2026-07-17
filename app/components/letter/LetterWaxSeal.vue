<script setup lang="ts">
import { sealOf } from '#shared/letters/visuals'

const props = withDefaults(defineProps<{
  sealId: string
  size?: 'sm' | 'md' | 'lg'
}>(), {
  size: 'md',
})

const seal = computed(() => sealOf(props.sealId))

const sizeClass = computed(() => ({
  sm: 'w-10 h-10 text-sm',
  md: 'w-[3.25rem] h-[3.25rem] text-lg',
  lg: 'w-16 h-16 text-xl',
}[props.size]))
</script>

<template>
  <span
    class="letter-seal"
    :class="sizeClass"
    :style="{
      '--seal-color': seal.color,
      '--seal-glow': seal.glow,
    }"
    :aria-label="`Wax seal: ${sealId}`"
    role="img"
  >
    <span aria-hidden="true">{{ seal.mark }}</span>
  </span>
</template>
