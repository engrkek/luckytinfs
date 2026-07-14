<script setup lang="ts">
const props = withDefaults(defineProps<{
  src: string
  alt: string
  class?: any
}>(), {
  class: 'size-40',
})
</script>

<template>
  <div class="stamp overflow-hidden" :class="props.class">
    <NuxtImg :src :alt draggable="false" class="w-full h-full object-cover object-center" />
  </div>
</template>

<style lang="css" scoped>
.stamp {
  --r: 10px;
  width: 100%;
  aspect-ratio: 1.5;
  padding: var(--r);
  background: #fff;
  mask:
    radial-gradient(at 50% 50%,#0000 50%,#000 50%) round
    var(--r) var(--r)/calc(2*var(--r)) calc(2*var(--r)),
    conic-gradient(#000 0 0) content-box;
}
</style>
