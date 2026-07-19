<script setup lang="ts">
import type { LetterStoryTool } from '~/composables/useLetterEditor'

defineProps<{
  activeTool: LetterStoryTool
}>()

const emit = defineEmits<{
  toggle: [tool: NonNullable<LetterStoryTool>]
}>()

const tools: { id: NonNullable<LetterStoryTool>, label: string, icon: string }[] = [
  { id: 'postcard', label: 'Card', icon: 'i-lucide-image' },
  { id: 'paper', label: 'Paper', icon: 'i-lucide-sheet' },
  { id: 'font', label: 'Type', icon: 'i-lucide-type' },
  { id: 'envelope', label: 'Env', icon: 'i-lucide-mail' },
  { id: 'seal', label: 'Seal', icon: 'i-lucide-circle-dot' },
  { id: 'sticker', label: 'Stick', icon: 'i-lucide-sparkles' },
  { id: 'music', label: 'Music', icon: 'i-lucide-music' },
]
</script>

<template>
  <nav
    class="letter-story-dock flex items-stretch justify-around gap-0.5 px-1 py-1.5"
    aria-label="Letter tools"
  >
    <button
      v-for="tool in tools"
      :key="tool.id"
      type="button"
      class="flex flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-2 transition-colors"
      :class="activeTool === tool.id
        ? 'bg-white/15 text-[#f4efe4]'
        : 'text-[#c8bfb0]/70 hover:text-[#f4efe4] hover:bg-white/5'"
      :aria-pressed="activeTool === tool.id"
      @click="emit('toggle', tool.id)"
    >
      <UIcon :name="tool.icon" class="size-5" />
      <span class="font-type text-[0.55rem] uppercase tracking-[0.12em]">
        {{ tool.label }}
      </span>
    </button>
  </nav>
</template>
