<script setup lang="ts">
import type { LetterDesign } from '#shared/letters/types'
import type { LetterStoryTool } from '~/composables/useLetterEditor'
import {
  LETTER_BACKGROUNDS,
  LETTER_ENVELOPES,
  LETTER_FONTS,
  LETTER_LIMITS,
  LETTER_SEALS,
  LETTER_STICKERS,
} from '#shared/letters/assets'
import { isSpotifyLink, parseSpotifyLink } from '#shared/letters/spotify'
import { paperOf, stickerGlyph } from '#shared/letters/visuals'

const props = defineProps<{
  tool: NonNullable<LetterStoryTool>
  design: LetterDesign
  selectedSticker: number | null
}>()

const emit = defineEmits<{
  'update:background': [id: string]
  'update:font': [id: string]
  'update:envelope': [id: string]
  'update:seal': [id: string]
  'update:music': [id: string | undefined]
  'addSticker': [id: string]
  'removeSticker': [index: number]
  'scaleSticker': [delta: number]
  'rotateSticker': [delta: number]
  'close': []
}>()

const title = computed(() => ({
  paper: 'Paper',
  font: 'Type',
  envelope: 'Envelope',
  seal: 'Wax seal',
  sticker: 'Stickers',
  music: 'Music',
}[props.tool]))

const selected = computed(() =>
  props.selectedSticker != null ? props.design.stickers[props.selectedSticker] : null,
)

const musicDraft = ref(props.design.music ?? '')
const musicError = ref<string | null>(null)

watch(() => props.design.music, (v) => {
  musicDraft.value = v ?? ''
  musicError.value = null
})

watch(() => props.tool, (t) => {
  if (t === 'music') {
    musicDraft.value = props.design.music ?? ''
    musicError.value = null
  }
})

function applyMusic() {
  const raw = musicDraft.value.trim()
  if (!raw) {
    musicError.value = null
    emit('update:music', undefined)
    return
  }
  if (!isSpotifyLink(raw)) {
    musicError.value = 'Paste an open.spotify.com link (track, album, or playlist)'
    return
  }
  musicError.value = null
  const parsed = parseSpotifyLink(raw)
  emit('update:music', parsed?.openUrl)
}

function clearMusic() {
  musicDraft.value = ''
  musicError.value = null
  emit('update:music', undefined)
}

const musicPreview = computed(() => parseSpotifyLink(props.design.music))
</script>

<template>
  <div class="letter-story-tray">
    <div class="flex items-center justify-between gap-3 px-4 pt-3 pb-2">
      <p class="font-type text-[0.65rem] uppercase tracking-[0.22em] text-[#c8bfb0]/70">
        {{ title }}
      </p>
      <button
        type="button"
        class="font-type text-[0.65rem] uppercase tracking-[0.16em] text-[#c8bfb0]/55 hover:text-[#f4efe4]"
        @click="emit('close')"
      >
        Done
      </button>
    </div>

    <!-- Paper -->
    <div v-if="tool === 'paper'" class="flex gap-2.5 overflow-x-auto px-4 pb-4 snap-x">
      <button
        v-for="opt in LETTER_BACKGROUNDS"
        :key="opt.id"
        type="button"
        class="snap-start shrink-0 w-16 h-20 rounded-lg border-2 overflow-hidden transition-transform active:scale-95 letter-paper !shadow-none"
        :class="[
          paperOf(opt.id).class,
          design.background === opt.id ? 'border-[#e0c56a] scale-105' : 'border-white/15',
        ]"
        :aria-label="opt.label"
        :aria-pressed="design.background === opt.id"
        @click="emit('update:background', opt.id)"
      >
        <span class="sr-only">{{ opt.label }}</span>
      </button>
    </div>

    <!-- Font -->
    <div v-else-if="tool === 'font'" class="flex gap-2 overflow-x-auto px-4 pb-4 snap-x">
      <button
        v-for="opt in LETTER_FONTS"
        :key="opt.id"
        type="button"
        class="snap-start shrink-0 min-w-22 rounded-xl border px-4 py-3 text-left transition-colors"
        :class="design.font === opt.id
          ? 'border-[#e0c56a] bg-white/10 text-[#f4efe4]'
          : 'border-white/10 bg-white/5 text-[#c8bfb0]'"
        @click="emit('update:font', opt.id)"
      >
        <span
          class="block text-lg leading-none"
          :class="{
            'font-hand': opt.id === 'hand',
            'font-script': opt.id === 'script',
            'font-type': opt.id === 'type',
            'font-sans': opt.id === 'sans',
          }"
        >
          Aa
        </span>
        <span class="mt-1 block font-type text-[0.55rem] uppercase tracking-[0.14em] opacity-70">
          {{ opt.label }}
        </span>
      </button>
    </div>

    <!-- Envelope -->
    <div v-else-if="tool === 'envelope'" class="flex gap-2.5 overflow-x-auto px-4 pb-4 snap-x">
      <button
        v-for="opt in LETTER_ENVELOPES"
        :key="opt.id"
        type="button"
        class="snap-start shrink-0 flex flex-col items-center gap-1.5"
        @click="emit('update:envelope', opt.id)"
      >
        <span
          class="block w-16 h-11 rounded-sm border-2 shadow-md"
          :class="design.envelope === opt.id ? 'border-[#e0c56a]' : 'border-white/20'"
          :style="{
            background: {
              'envelope-white': '#f7f3ec',
              'envelope-cream': '#f3e6c8',
              'envelope-blush': '#f6d9d6',
              'envelope-sky': '#d5e4f4',
              'envelope-kraft': '#c9a66b',
            }[opt.id],
          }"
        />
        <span class="font-type text-[0.55rem] uppercase tracking-[0.1em] text-[#c8bfb0]/70">
          {{ opt.label }}
        </span>
      </button>
    </div>

    <!-- Seal -->
    <div v-else-if="tool === 'seal'" class="flex gap-3 overflow-x-auto px-4 pb-4 snap-x items-end">
      <button
        v-for="opt in LETTER_SEALS"
        :key="opt.id"
        type="button"
        class="snap-start shrink-0 flex flex-col items-center gap-1.5 rounded-xl p-1.5 transition-transform"
        :class="design.seal === opt.id ? 'ring-2 ring-[#e0c56a] ring-offset-2 ring-offset-[#1a2230]' : ''"
        @click="emit('update:seal', opt.id)"
      >
        <LetterWaxSeal :seal-id="opt.id" size="md" />
        <span class="font-type text-[0.55rem] uppercase tracking-[0.1em] text-[#c8bfb0]/70">
          {{ opt.label }}
        </span>
      </button>
    </div>

    <!-- Stickers -->
    <div v-else-if="tool === 'sticker'" class="px-4 pb-4 space-y-3">
      <div class="flex gap-2 overflow-x-auto snap-x pb-1">
        <button
          v-for="opt in LETTER_STICKERS"
          :key="opt.id"
          type="button"
          class="snap-start shrink-0 size-14 rounded-xl border border-white/10 bg-white/5 text-2xl grid place-items-center text-[#f4efe4] hover:bg-white/10 active:scale-95 transition-transform disabled:opacity-40"
          :disabled="design.stickers.length >= LETTER_LIMITS.stickersMax"
          :aria-label="`Add ${opt.label}`"
          @click="emit('addSticker', opt.id)"
        >
          {{ stickerGlyph(opt.id) }}
        </button>
      </div>

      <div
        v-if="selected"
        class="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
      >
        <p class="font-type text-[0.6rem] uppercase tracking-[0.14em] text-[#c8bfb0]/70">
          Selected · drag on letter
        </p>
        <div class="flex items-center gap-1">
          <button
            type="button"
            class="size-9 rounded-lg bg-white/10 text-[#f4efe4] text-sm"
            aria-label="Smaller"
            @click="emit('scaleSticker', -0.15)"
          >
            −
          </button>
          <button
            type="button"
            class="size-9 rounded-lg bg-white/10 text-[#f4efe4] text-sm"
            aria-label="Larger"
            @click="emit('scaleSticker', 0.15)"
          >
            +
          </button>
          <button
            type="button"
            class="size-9 rounded-lg bg-white/10 text-[#f4efe4] text-sm"
            aria-label="Rotate"
            @click="emit('rotateSticker', 15)"
          >
            ↻
          </button>
          <button
            type="button"
            class="size-9 rounded-lg bg-red-500/20 text-red-200 text-sm"
            aria-label="Delete sticker"
            @click="selectedSticker != null && emit('removeSticker', selectedSticker)"
          >
            ⌫
          </button>
        </div>
      </div>
      <p
        v-else
        class="font-type text-[0.6rem] uppercase tracking-[0.14em] text-[#c8bfb0]/45"
      >
        Tap a sticker to add · {{ design.stickers.length }}/{{ LETTER_LIMITS.stickersMax }}
      </p>
    </div>

    <!-- Music = Spotify link -->
    <div v-else-if="tool === 'music'" class="px-4 pb-4 space-y-3">
      <p class="text-xs text-[#c8bfb0]/70 leading-relaxed">
        Paste a Spotify track link. Readers can play the full song while they read (after they turn sound on).
      </p>
      <div class="flex gap-2">
        <input
          v-model="musicDraft"
          type="url"
          inputmode="url"
          autocomplete="off"
          spellcheck="false"
          placeholder="https://open.spotify.com/track/…"
          class="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-[#f4efe4] placeholder:text-[#c8bfb0]/35 outline-none focus:border-[#e0c56a]/50"
          @keydown.enter.prevent="applyMusic"
        >
        <button
          type="button"
          class="shrink-0 rounded-xl bg-[#e0c56a] px-4 py-2 font-display text-sm font-medium text-[#1a2230]"
          @click="applyMusic"
        >
          Set
        </button>
      </div>
      <p v-if="musicError" class="text-xs text-red-300" role="alert">
        {{ musicError }}
      </p>
      <div
        v-if="musicPreview"
        class="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
      >
        <div class="min-w-0">
          <p class="font-type text-[0.55rem] uppercase tracking-[0.16em] text-[#c8bfb0]/55">
            Linked · {{ musicPreview.type }}
          </p>
          <p class="truncate text-xs text-[#f4efe4]/90 font-mono">
            {{ musicPreview.id }}
          </p>
        </div>
        <button
          type="button"
          class="shrink-0 font-type text-[0.6rem] uppercase tracking-[0.14em] text-red-200/90"
          @click="clearMusic"
        >
          Remove
        </button>
      </div>
      <p v-else class="font-type text-[0.55rem] uppercase tracking-[0.14em] text-[#c8bfb0]/40">
        No song linked
      </p>
    </div>
  </div>
</template>
