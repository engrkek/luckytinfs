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
  move: [patch: Partial<{ x: number, y: number, rotation: number, scale: number }>]
}>()

const el = ref<HTMLElement | null>(null)
const dragging = ref(false)
const src = computed(() => stickerSrc(props.sticker.id))

/** Base pixel size; scale multiplies */
const basePx = 56

/**
 * One finger drags (relative to grab point, no snap-to-center),
 * a second finger anywhere pinches to scale + rotate.
 */
const pointers = new Map<number, { x: number, y: number }>()
/** Anchor pointer position + sticker x/y at gesture start */
let grab: { px: number, py: number, x: number, y: number } | null = null
let pinch: { dist: number, angle: number, scale: number, rotation: number } | null = null

function anchor(): { x: number, y: number } {
  if (pinch && pointers.size === 2) {
    const [a, b] = [...pointers.values()] as [{ x: number, y: number }, { x: number, y: number }]
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
  }
  const p = [...pointers.values()][0]
  return p ?? { x: 0, y: 0 }
}

function setGrab() {
  const a = anchor()
  grab = { px: a.x, py: a.y, x: props.sticker.x, y: props.sticker.y }
}

function onPointerDown(e: PointerEvent) {
  if (!props.interactive)
    return
  e.preventDefault()
  e.stopPropagation()
  emit('select')
  addPointer(e)
}

function addPointer(e: PointerEvent) {
  if (pointers.size >= 2)
    return
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
  if (pointers.size === 1) {
    dragging.value = true
    window.addEventListener('pointerdown', onWindowDown)
    window.addEventListener('pointermove', onWindowMove)
    window.addEventListener('pointerup', onWindowUp)
    window.addEventListener('pointercancel', onWindowUp)
  }
  else {
    const [a, b] = [...pointers.values()] as [{ x: number, y: number }, { x: number, y: number }]
    pinch = {
      dist: Math.hypot(b.x - a.x, b.y - a.y),
      angle: Math.atan2(b.y - a.y, b.x - a.x),
      scale: props.sticker.scale,
      rotation: props.sticker.rotation,
    }
  }
  setGrab()
}

/** Second finger can land anywhere, not just on the sticker */
function onWindowDown(e: PointerEvent) {
  e.preventDefault()
  addPointer(e)
}

function onWindowMove(e: PointerEvent) {
  if (!pointers.has(e.pointerId) || !grab)
    return
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
  const parent = el.value?.offsetParent as HTMLElement | null
  if (!parent)
    return
  const rect = parent.getBoundingClientRect()
  const a = anchor()
  const patch: Partial<{ x: number, y: number, rotation: number, scale: number }> = {
    x: grab.x + ((a.x - grab.px) / rect.width) * 100,
    y: grab.y + ((a.y - grab.py) / rect.height) * 100,
  }
  if (pinch && pointers.size === 2) {
    const [p, q] = [...pointers.values()] as [{ x: number, y: number }, { x: number, y: number }]
    patch.scale = pinch.scale * (Math.hypot(q.x - p.x, q.y - p.y) / pinch.dist)
    patch.rotation = pinch.rotation + (Math.atan2(q.y - p.y, q.x - p.x) - pinch.angle) * (180 / Math.PI)
  }
  emit('move', patch)
}

function onWindowUp(e: PointerEvent) {
  if (!pointers.delete(e.pointerId))
    return
  pinch = null
  if (pointers.size === 0) {
    dragging.value = false
    grab = null
    removeWindowListeners()
  }
  else {
    // Re-anchor to the remaining finger so the sticker doesn't jump
    setGrab()
  }
}

function removeWindowListeners() {
  window.removeEventListener('pointerdown', onWindowDown)
  window.removeEventListener('pointermove', onWindowMove)
  window.removeEventListener('pointerup', onWindowUp)
  window.removeEventListener('pointercancel', onWindowUp)
}

onBeforeUnmount(removeWindowListeners)
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
