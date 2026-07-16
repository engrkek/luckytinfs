<script setup lang="ts">
const props = withDefaults(defineProps<{
  src: string
  alt: string
  class?: any
  imgClass?: any
}>(), {
  class: 'size-40',
})
</script>

<template>
  <div class="stamp overflow-hidden" :class="props.class">
    <div class="stamp__matte">
      <NuxtImg
        :src
        :alt
        draggable="false"
        class="w-full h-full object-cover object-center"
        :class="props.imgClass"
      />
    </div>
  </div>
</template>

<style lang="css" scoped>
.stamp {
  --r: 10px;
  --pad: 4px;
  width: 100%;
  padding: var(--r);
  background: #fff;
  mask:
    radial-gradient(at 50% 50%, #0000 50%, #000 50%) round
      var(--r) var(--r) / calc(2 * var(--r)) calc(2 * var(--r)),
    conic-gradient(#000 0 0) content-box;
}

.stamp__matte {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: var(--pad);
  background: #fff;
}
</style>
