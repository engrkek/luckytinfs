<script setup lang="ts">
import type { LetterStickerPlacement } from '#shared/letters/types'
import { stickerGlyph } from '#shared/letters/visuals'

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
    class="absolute z-10 leading-none select-none drop-shadow-sm touch-none"
    :class="[
      interactive ? 'cursor-grab active:cursor-grabbing pointer-events-auto' : 'pointer-events-none',
      selected && 'story-sticker--selected',
      dragging && 'z-20',
    ]"
    :style="{
      left: `${sticker.x}%`,
      top: `${sticker.y}%`,
      transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg) scale(${sticker.scale})`,
      fontSize: '1.75rem',
      color: 'color-mix(in srgb, currentColor 90%, transparent)',
      opacity: 0.92,
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
    {{ stickerGlyph(sticker.id) }}
  </span>
</template>
