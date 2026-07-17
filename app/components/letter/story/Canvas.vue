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
}>()

const emit = defineEmits<{
  'update:body': [value: string]
  'update:editingText': [value: boolean]
  'selectSticker': [index: number | null]
  'moveSticker': [index: number, pos: { x: number, y: number }]
}>()

const paper = computed(() => paperOf(props.design.background))
const fontClass = computed(() => fontOf(props.design.font))
const theme = computed(() =>
  props.recipient ? RECIPIENT_THEME[props.recipient] : RECIPIENT_THEME.bini,
)

const textareaRef = ref<HTMLTextAreaElement | null>(null)

watch(() => props.editingText, async (on) => {
  if (on) {
    await nextTick()
    textareaRef.value?.focus()
  }
})

function startEditing() {
  emit('update:editingText', true)
  emit('selectSticker', null)
}

function stopEditing() {
  emit('update:editingText', false)
}

function onCanvasTap() {
  emit('selectSticker', null)
  if (props.editingText)
    stopEditing()
}

function onBodyInput(e: Event) {
  const t = e.target as HTMLTextAreaElement
  emit('update:body', t.value.slice(0, props.bodyMax))
}
</script>

<template>
  <article
    class="letter-paper letter-story-canvas relative w-full overflow-hidden rounded-sm"
    :class="paper.class"
    :style="{ color: paper.ink }"
    @pointerdown.self="onCanvasTap"
  >
    <!-- header -->
    <div class="relative z-2 flex items-start justify-between gap-3 px-5 pt-5 sm:px-7 sm:pt-7 pointer-events-none">
      <div>
        <p class="font-type text-[0.6rem] uppercase tracking-[0.22em] opacity-50">
          Signals World Tour ’26
        </p>
        <p class="mt-1 font-display text-lg font-medium tracking-tight" :style="{ color: theme.deep }">
          {{ recipient ? theme.toLine : 'Choose a recipient…' }}
        </p>
      </div>
      <LetterWaxSeal :seal-id="design.seal" size="sm" class="opacity-90 pointer-events-none" />
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
          @blur="stopEditing"
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
          @click.stop="startEditing"
        >
          {{ body.trim() || 'Tap to write your letter…' }}
        </button>
      </div>
    </div>

    <!-- footer -->
    <footer class="relative z-2 px-5 pb-5 sm:px-7 sm:pb-7 pt-3 border-t border-current/10 flex items-end justify-between gap-3 pointer-events-none">
      <div>
        <p class="font-type text-[0.55rem] uppercase tracking-[0.18em] opacity-45">
          With love from
        </p>
        <p class="mt-0.5 text-lg font-hand opacity-80">
          {{ senderName.trim() || 'Anonymous' }}
        </p>
      </div>
      <span
        v-if="design.music"
        class="font-type text-[0.55rem] uppercase tracking-[0.16em] opacity-50"
        title="Spotify soundtrack linked"
      >
        ♫ Spotify
      </span>
    </footer>
  </article>
</template>
