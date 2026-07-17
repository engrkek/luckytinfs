<script setup lang="ts">
import type { LetterDesign, LetterRecipient } from '#shared/letters/types'
import { fontOf, paperOf, RECIPIENT_THEME } from '#shared/letters/visuals'

const props = defineProps<{
  recipient: LetterRecipient | null
  senderName: string
  design: LetterDesign
  body: string
  editingText: boolean
  selectedSticker: number | null
  bodyMax: number
  senderNameMax: number
}>()

const emit = defineEmits<{
  'update:body': [value: string]
  'update:senderName': [value: string]
  'update:editingText': [value: boolean]
  'selectSticker': [index: number | null]
  'moveSticker': [index: number, pos: { x: number, y: number }]
}>()

const paper = computed(() => paperOf(props.design.background))
const fontClass = computed(() => fontOf(props.design.font))
const theme = computed(() =>
  props.recipient ? RECIPIENT_THEME[props.recipient] : RECIPIENT_THEME.bini,
)

const paperStyle = computed(() => {
  const base: Record<string, string> = { color: paper.value.ink }
  if (paper.value.src) {
    base.backgroundImage = `url(${paper.value.src})`
    base['--paper-wash'] = String(paper.value.wash ?? 0.3)
  }
  return base
})

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const nameInputRef = ref<HTMLInputElement | null>(null)
const editingName = ref(false)

watch(() => props.editingText, async (on) => {
  if (on) {
    editingName.value = false
    await nextTick()
    textareaRef.value?.focus()
  }
})

watch(editingName, async (on) => {
  if (on) {
    emit('update:editingText', false)
    emit('selectSticker', null)
    await nextTick()
    nameInputRef.value?.focus()
    nameInputRef.value?.select()
  }
})

function startEditingBody() {
  editingName.value = false
  emit('update:editingText', true)
  emit('selectSticker', null)
}

function stopEditingBody() {
  emit('update:editingText', false)
}

function startEditingName() {
  editingName.value = true
}

function stopEditingName() {
  editingName.value = false
}

function onCanvasTap() {
  emit('selectSticker', null)
  if (props.editingText)
    stopEditingBody()
  if (editingName.value)
    stopEditingName()
}

function onBodyInput(e: Event) {
  const t = e.target as HTMLTextAreaElement
  emit('update:body', t.value.slice(0, props.bodyMax))
}

function onNameInput(e: Event) {
  const t = e.target as HTMLInputElement
  emit('update:senderName', t.value.slice(0, props.senderNameMax))
}
</script>

<template>
  <article
    class="letter-paper letter-story-canvas relative w-full overflow-hidden rounded-sm"
    :class="paper.class"
    :style="paperStyle"
    @pointerdown.self="onCanvasTap"
  >
    <!-- header -->
    <div class="relative z-2 px-5 pt-5 sm:px-7 sm:pt-7 pointer-events-none">
      <p class="font-type text-[0.6rem] uppercase tracking-[0.22em] opacity-50">
        Signals World Tour ’26
      </p>
      <p class="mt-1 font-display text-lg font-medium tracking-tight" :style="{ color: theme.deep }">
        {{ recipient ? theme.toLine : 'Choose a recipient…' }}
      </p>
    </div>

    <!-- body + stickers -->
    <div
      class="relative z-2 min-h-[52dvh] px-5 pb-4 pt-4 sm:px-7"
      @pointerdown.self="onCanvasTap"
    >
      <LetterSticker
        v-for="(sticker, i) in design.stickers"
        :key="`${sticker.id}-${i}`"
        :sticker="sticker"
        interactive
        :selected="selectedSticker === i"
        @select="emit('selectSticker', i)"
        @move="(pos) => emit('moveSticker', i, pos)"
      />

      <!-- text surface -->
      <div class="relative z-3 min-h-40">
        <textarea
          v-if="editingText"
          ref="textareaRef"
          class="letter-story-textarea w-full resize-none bg-transparent outline-none border-0 p-0 m-0"
          :class="[
            fontClass,
            design.font === 'script' ? 'text-xl sm:text-2xl leading-snug' : 'text-base sm:text-lg leading-relaxed',
            design.font === 'type' ? 'text-[0.95rem] sm:text-base leading-[1.7]' : '',
          ]"
          :style="{ color: paper.ink }"
          :value="body"
          :maxlength="bodyMax"
          rows="10"
          placeholder="Write something heartfelt…"
          @input="onBodyInput"
          @blur="stopEditingBody"
        />
        <button
          v-else
          type="button"
          class="w-full text-left whitespace-pre-wrap text-pretty min-h-40"
          :class="[
            fontClass,
            design.font === 'script' ? 'text-xl sm:text-2xl leading-snug' : 'text-base sm:text-lg leading-relaxed',
            design.font === 'type' ? 'text-[0.95rem] sm:text-base leading-[1.7]' : '',
            !body.trim() && 'opacity-45',
          ]"
          @click.stop="startEditingBody"
        >
          {{ body.trim() || 'Tap to write your letter…' }}
        </button>
      </div>
    </div>

    <!-- signature -->
    <footer class="relative z-2 px-5 pb-5 sm:px-7 sm:pb-7 pt-3 border-t border-current/10 flex items-end justify-between gap-3">
      <div class="min-w-0 flex-1 pointer-events-auto">
        <p class="font-type text-[0.55rem] uppercase tracking-[0.18em] opacity-45">
          With love from
        </p>
        <input
          v-if="editingName"
          ref="nameInputRef"
          type="text"
          class="mt-0.5 w-full max-w-xs bg-transparent border-0 border-b border-current/25 p-0 m-0 text-lg outline-none focus:border-current/50"
          :class="[
            fontClass,
            design.font === 'script' ? 'text-xl sm:text-2xl' : '',
            design.font === 'type' ? 'text-base sm:text-lg' : '',
          ]"
          :style="{ color: paper.ink }"
          :value="senderName"
          :maxlength="senderNameMax"
          placeholder="Your name"
          autocomplete="nickname"
          @input="onNameInput"
          @blur="stopEditingName"
          @keydown.enter.prevent="stopEditingName"
        >
        <button
          v-else
          type="button"
          class="mt-0.5 block max-w-full text-left text-lg transition-opacity"
          :class="[
            fontClass,
            design.font === 'script' ? 'text-xl sm:text-2xl' : '',
            design.font === 'type' ? 'text-base sm:text-lg' : '',
            senderName.trim() ? 'opacity-90' : 'opacity-45',
          ]"
          @click.stop="startEditingName"
        >
          {{ senderName.trim() || 'Tap to sign…' }}
        </button>
      </div>
      <span
        v-if="design.music"
        class="shrink-0 font-type text-[0.55rem] uppercase tracking-[0.16em] opacity-50 pointer-events-none"
        title="YouTube soundtrack linked"
      >
        ♫ YouTube
      </span>
    </footer>
  </article>
</template>
