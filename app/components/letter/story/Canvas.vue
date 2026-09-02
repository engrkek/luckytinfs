<script setup lang="ts">
import type { LetterDesign, LetterRecipient } from '#shared/letters/types'
import { bodyTypeOf, paperOf, RECIPIENT_THEME, signatureTypeOf } from '#shared/letters/visuals'

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
  'moveSticker': [index: number, patch: Partial<{ x: number, y: number, rotation: number, scale: number }>]
}>()

const paper = computed(() => paperOf(props.design.background))
const bodyTypeClass = computed(() => bodyTypeOf(props.design.font, props.design.fontSize))
const signatureTypeClass = computed(() => signatureTypeOf(props.design.font, props.design.fontSize))
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

/** Postcard editing: peek at the photo front; writing happens on the back */
const showFront = ref(false)
const isPostcard = computed(() => props.design.format === 'postcard')
watch(isPostcard, (on) => {
  if (!on)
    showFront.value = false
})
</script>

<template>
  <div class="w-full">
    <div v-if="isPostcard" class="mb-2 flex justify-center gap-1.5">
      <button
        type="button"
        class="rounded-full border px-3 py-1 font-type text-xs uppercase tracking-[0.14em] transition-colors"
        :class="!showFront
          ? 'border-[#e0c56a]/80 bg-[#e0c56a] text-black'
          : 'border-white/10 bg-black text-[#c8bfb0]'"
        @click="showFront = false"
      >
        Message
      </button>
      <button
        type="button"
        class="rounded-full border px-3 py-1 font-type text-xs uppercase tracking-[0.14em] transition-colors"
        :class="showFront
          ? 'border-[#e0c56a]/80 bg-[#e0c56a] text-black'
          : 'border-white/10 bg-black text-[#c8bfb0]'"
        @click="showFront = true"
      >
        Photo front
      </button>
    </div>

    <!-- Postcard front: the cropped photo -->
    <div
      v-if="isPostcard && showFront"
      class="relative aspect-3/2 w-full overflow-hidden rounded-sm bg-white/5"
    >
      <img
        v-if="design.photo"
        :src="`/${design.photo}`"
        alt="Postcard front"
        class="absolute inset-0 size-full object-cover"
      >
      <p v-else class="absolute inset-0 grid place-items-center px-6 text-center text-sm text-[#c8bfb0]/60">
        No photo yet. Add one from the Card tool below.
      </p>
    </div>

    <!-- Postcard message side: meta + signature on the left, message on the right (3:2, matches the reading view) -->
    <article
      v-if="isPostcard"
      v-show="!showFront"
      class="letter-paper relative flex aspect-3/2 w-full gap-4 overflow-hidden rounded-sm p-4 sm:p-5"
      :class="paper.class"
      :style="paperStyle"
      @pointerdown.self="onCanvasTap"
    >
      <div class="relative z-2 flex h-full w-[34%] shrink-0 flex-col justify-between border-r border-current/15 pr-4 pointer-events-none">
        <div>
          <p class="mt-1 font-display text-sm font-medium tracking-tight sm:text-base" :style="{ color: theme.deep }">
            {{ recipient ? theme.toLine : 'Choose a recipient…' }}
          </p>
        </div>
        <div class="pointer-events-auto">
          <p class="font-type text-[0.5rem] uppercase tracking-[0.16em] opacity-45">
            With love from
          </p>
          <input
            v-if="editingName"
            ref="nameInputRef"
            type="text"
            class="mt-0.5 w-full bg-transparent border-0 border-b border-current/25 p-0 m-0 outline-none focus:border-current/50"
            :class="signatureTypeClass"
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
            class="mt-0.5 block max-w-full text-left transition-opacity"
            :class="[signatureTypeClass, senderName.trim() ? 'opacity-90' : 'opacity-45']"
            @click.stop="startEditingName"
          >
            {{ senderName.trim() || 'Sign your name…' }}
          </button>
        </div>
      </div>

      <div class="relative z-2 h-full min-w-0 flex-1 overflow-y-auto">
        <textarea
          v-if="editingText"
          ref="textareaRef"
          class="letter-story-textarea relative z-3 w-full resize-none bg-transparent outline-none border-0 p-0 m-0"
          :class="bodyTypeClass"
          :style="{ color: paper.ink }"
          :value="body"
          :maxlength="bodyMax"
          rows="8"
          placeholder="Write your letter…"
          @input="onBodyInput"
          @blur="stopEditingBody"
        />
        <button
          v-else
          type="button"
          class="relative z-3 w-full text-left whitespace-pre-wrap text-pretty"
          :class="[bodyTypeClass, !body.trim() && 'opacity-45']"
          @click.stop="startEditingBody"
        >
          {{ body.trim() || 'Write your letter…' }}
        </button>
      </div>

      <!-- Stickers use the full postcard surface (not just the message column) -->
      <div class="pointer-events-none absolute inset-0 z-10">
        <LetterSticker
          v-for="(sticker, i) in design.stickers"
          :key="`${sticker.id}-${i}`"
          :sticker="sticker"
          interactive
          :selected="selectedSticker === i"
          @select="emit('selectSticker', i)"
          @move="(pos) => emit('moveSticker', i, pos)"
        />
      </div>
    </article>

    <article
      v-else
      class="letter-paper letter-story-canvas relative w-full overflow-hidden rounded-sm"
      :class="paper.class"
      :style="paperStyle"
      @pointerdown.self="onCanvasTap"
    >
      <!-- header -->
      <div class="relative z-2 px-5 pt-5 sm:px-7 sm:pt-7 pointer-events-none">
        <p class="mt-1 font-display text-lg font-medium tracking-tight" :style="{ color: theme.deep }">
          {{ recipient ? theme.toLine : 'Choose a recipient…' }}
        </p>
      </div>

      <!-- body text -->
      <div
        class="relative z-2 min-h-[52dvh] px-5 pb-4 pt-4 sm:px-7"
        @pointerdown.self="onCanvasTap"
      >
        <div class="relative z-3 min-h-40">
          <textarea
            v-if="editingText"
            ref="textareaRef"
            class="letter-story-textarea w-full resize-none bg-transparent outline-none border-0 p-0 m-0"
            :class="bodyTypeClass"
            :style="{ color: paper.ink }"
            :value="body"
            :maxlength="bodyMax"
            rows="10"
            placeholder="Write your letter…"
            @input="onBodyInput"
            @blur="stopEditingBody"
          />
          <button
            v-else
            type="button"
            class="flex w-full items-start text-left whitespace-pre-wrap text-pretty min-h-40"
            :class="[bodyTypeClass, !body.trim() && 'opacity-45']"
            @click.stop="startEditingBody"
          >
            {{ body.trim() || 'Write your letter…' }}
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
            class="mt-0.5 w-full max-w-xs bg-transparent border-0 border-b border-current/25 p-0 m-0 outline-none focus:border-current/50"
            :class="signatureTypeClass"
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
            class="mt-0.5 block max-w-full text-left transition-opacity"
            :class="[signatureTypeClass, senderName.trim() ? 'opacity-90' : 'opacity-45']"
            @click.stop="startEditingName"
          >
            {{ senderName.trim() || 'Sign your name…' }}
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

      <!-- Stickers use the full letter surface (header, body, signature) -->
      <div class="pointer-events-none absolute inset-0 z-10">
        <LetterSticker
          v-for="(sticker, i) in design.stickers"
          :key="`${sticker.id}-${i}`"
          :sticker="sticker"
          interactive
          :selected="selectedSticker === i"
          @select="emit('selectSticker', i)"
          @move="(pos) => emit('moveSticker', i, pos)"
        />
      </div>
    </article>
  </div>
</template>
