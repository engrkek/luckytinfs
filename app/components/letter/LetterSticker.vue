<script setup lang="ts">
import type { LetterStickerPlacement } from '#shared/letters/types'
import { stickerSrc } from '#shared/letters/visuals'

const props = defineProps<{
  sticker: LetterStickerPlacement
  interactive?: boolean
  selected?: boolean
}>()

const emit = defineEmits<{
  select: []
  move: [pos: { x: number, y: number }]
}>()

const el = ref<HTMLElement | null>(null)
const dragging = ref(false)
const src = computed(() => stickerSrc(props.sticker.id))

/** Base pixel size; scale multiplies */
const basePx = 56

function onPointerDown(e: PointerEvent) {
  if (!props.interactive)
    return
  e.preventDefault()
  e.stopPropagation()
  emit('select')
  dragging.value = true
  el.value?.setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!dragging.value || !el.value)
    return
  const parent = el.value.offsetParent as HTMLElement | null
  if (!parent)
    return
  const rect = parent.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * 100
  const y = ((e.clientY - rect.top) / rect.height) * 100
  emit('move', { x, y })
}

function onPointerUp(e: PointerEvent) {
  if (!dragging.value)
    return
  dragging.value = false
  try {
    el.value?.releasePointerCapture(e.pointerId)
  }
  catch {
    // already released
  }
}
</script>

<template>
  <span
    ref="el"
    class="absolute z-10 select-none touch-none"
    :class="[
      interactive ? 'cursor-grab active:cursor-grabbing pointer-events-auto' : 'pointer-events-none',
      selected && 'story-sticker--selected',
      dragging && 'z-20',
    ]"
    :style="{
      left: `${sticker.x}%`,
      top: `${sticker.y}%`,
      width: `${basePx * sticker.scale}px`,
      height: `${basePx * sticker.scale}px`,
      transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg)`,
    }"
    :aria-hidden="!interactive"
    :role="interactive ? 'button' : undefined"
    :tabindex="interactive ? 0 : undefined"
    :aria-label="interactive ? `Sticker ${sticker.id}` : undefined"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @click.stop="interactive && emit('select')"
  >
    <img
      v-if="src"
      :src="src"
      alt=""
      draggable="false"
      class="pointer-events-none block size-full object-contain drop-shadow-sm"
    >
    <span
      v-else
      class="grid size-full place-items-center text-2xl opacity-80"
      aria-hidden="true"
    >✦</span>
  </span>
</template>
