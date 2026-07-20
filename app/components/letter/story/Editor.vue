<script setup lang="ts">
import type { LetterStoryTool } from '~/composables/useLetterEditor'
import { LETTER_RECIPIENTS } from '#shared/letters/assets'
import { isLetterRecipient } from '#shared/letters/public'

const editor = useLetterEditor()

const initialTo = String(useRoute().query.to || '')
if (isLetterRecipient(initialTo))
  editor.recipient.value = initialTo
const {
  recipient,
  tourStop,
  senderName,
  senderEmail,
  body,
  visibility,
  design,
  activeTool,
  selectedSticker,
  editingText,
  sendOpen,
  sealing,
  canSubmit,
  toggleTool,
  closeTool,
  addSticker,
  removeSticker,
  updateSticker,
  submit,
  onCeremonyComplete,
  submitting,
  submitError,
  submittedId,
  reset,
  bodyMax,
  limits,
} = editor

function openSend() {
  closeTool()
  editingText.value = false
  selectedSticker.value = null
  sendOpen.value = true
}

function onMoveSticker(index: number, patch: Partial<{ x: number, y: number, rotation: number, scale: number }>) {
  updateSticker(index, patch)
}

function onScale(delta: number) {
  if (selectedSticker.value == null)
    return
  const s = design.stickers[selectedSticker.value]
  if (!s)
    return
  updateSticker(selectedSticker.value, { scale: s.scale + delta })
}

function onRotate(delta: number) {
  if (selectedSticker.value == null)
    return
  const s = design.stickers[selectedSticker.value]
  if (!s)
    return
  updateSticker(selectedSticker.value, { rotation: s.rotation + delta })
}

function onTool(tool: NonNullable<LetterStoryTool>) {
  editingText.value = false
  toggleTool(tool)
}

const bodyCount = computed(() => body.value.length)

/** Live envelope+seal when picking packaging */
const showEnvelopePreview = computed(() =>
  activeTool.value === 'envelope' || activeTool.value === 'seal',
)

const previewRecipient = computed(() => recipient.value ?? 'bini')
</script>

<template>
  <div
    v-if="submittedId && !sealing"
    class="letter-stage flex min-h-dvh flex-col items-center justify-center px-6 text-center"
  >
    <div class="relative z-1 max-w-sm space-y-5">
      <LetterEnvelope
        :recipient="previewRecipient"
        :sender-name="senderName"
        :design="design"
        :open="false"
        :interactive="false"
        class="w-full max-w-sm!"
      />
      <h1 class="font-display text-2xl font-medium tracking-tight text-white/95">
        Letter sealed
      </h1>
      <p class="text-sm text-white/50 text-pretty leading-relaxed">
        Sent for review. Once approved, it can appear in the letters list.
      </p>
      <div class="flex flex-col gap-2 pt-1">
        <button
          type="button"
          class="rounded-full bg-white px-6 py-3 font-display font-medium text-neutral-900"
          @click="reset"
        >
          Write another
        </button>
        <NuxtLink
          :to="recipient ? { path: '/letters', query: { to: recipient } } : '/letters'"
          class="rounded-full border border-white/15 px-6 py-3 font-type text-[0.7rem] uppercase tracking-[0.18em] text-white/55"
        >
          Browse letters
        </NuxtLink>
      </div>
    </div>
  </div>

  <!-- Seal ceremony -->
  <div
    v-else-if="sealing && recipient"
    class="letter-stage fixed inset-0 z-50 flex flex-col items-center justify-center px-5"
  >
    <LetterSendCeremony
      :recipient="recipient"
      :sender-name="senderName"
      :body="body"
      :design="design"
      @complete="onCeremonyComplete"
    />
  </div>

  <!-- Story editor stage -->
  <div
    v-else
    class="letter-story-stage fixed inset-0 z-40 flex flex-col bg-[#0c0e12] text-[#e8e2d6]"
  >
    <header class="relative z-20 flex items-center justify-between gap-3 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
      <NuxtLink
        to="/letters"
        class="grid size-10 place-items-center rounded-full bg-white/5 text-white/90 backdrop-blur-sm border border-white/10"
        aria-label="Close editor"
      >
        <UIcon name="i-lucide-x" class="size-5" />
      </NuxtLink>

      <div class="flex min-w-0 flex-1 items-center justify-center gap-1.5 overflow-x-auto">
        <button
          v-for="r in LETTER_RECIPIENTS"
          :key="r.id"
          type="button"
          class="shrink-0 rounded-full border px-3 py-1 font-type text-[0.6rem] uppercase tracking-[0.14em] transition-colors"
          :class="recipient === r.id
            ? 'border-[#e0c56a]/80 bg-[#e0c56a]/20 text-[#f4efe4]'
            : 'border-white/10 bg-black/25 text-[#c8bfb0]/75'"
          @click="recipient = r.id"
        >
          {{ r.label }}
        </button>
      </div>

      <button
        type="button"
        class="shrink-0 rounded-full bg-[#e0c56a] px-4 py-2 font-display text-sm font-medium text-[#1a2230] disabled:opacity-40"
        :disabled="!body.trim()"
        @click="openSend"
      >
        Send
      </button>
    </header>

    <div
      class="relative z-10 flex-1 overflow-y-auto overscroll-contain px-3 pb-2 sm:px-6"
      @pointerdown="selectedSticker = null"
    >
      <div class="mx-auto max-w-md py-2">
        <!-- Envelope + seal live preview while styling packaging -->
        <div
          v-if="showEnvelopePreview"
          class="mb-5 rounded-xl border border-white/8 bg-white/3 px-3 py-6 sm:px-5 sm:py-8"
        >
          <p class="mb-5 text-center font-type text-[0.55rem] uppercase tracking-[0.2em] text-white/35">
            Envelope preview
          </p>
          <LetterEnvelope
            :recipient="previewRecipient"
            :sender-name="senderName"
            :design="design"
            :open="false"
            :interactive="false"
            class="w-full max-w-none!"
          />
        </div>

        <LetterStoryCanvas
          v-show="!showEnvelopePreview"
          :recipient="recipient"
          :sender-name="senderName"
          :design="design"
          :body="body"
          :editing-text="editingText"
          :selected-sticker="selectedSticker"
          :body-max="bodyMax"
          :sender-name-max="limits.senderNameMax"
          @update:body="body = $event"
          @update:sender-name="senderName = $event"
          @update:editing-text="editingText = $event"
          @select-sticker="selectedSticker = $event"
          @move-sticker="onMoveSticker"
        />

        <p
          v-if="!showEnvelopePreview"
          class="mt-2 text-center font-type text-[0.55rem] uppercase tracking-[0.16em]"
          :class="bodyCount > bodyMax ? 'text-red-400' : 'text-white/30'"
        >
          {{ bodyCount }}/{{ bodyMax }}
        </p>
      </div>
    </div>

    <div class="relative z-20 border-t border-white/10 bg-[#0c0e12]/95 backdrop-blur-md pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <LetterStoryTray
        v-if="activeTool"
        :tool="activeTool"
        :design="design"
        :selected-sticker="selectedSticker"
        @close="closeTool"
        @update:format="design.format = $event"
        @update:photo="design.photo = $event"
        @update:background="design.background = $event"
        @update:font="design.font = $event"
        @update:envelope="design.envelope = $event"
        @update:seal="design.seal = $event"
        @update:music="design.music = $event"
        @add-sticker="addSticker"
        @remove-sticker="removeSticker"
        @scale-sticker="onScale"
        @rotate-sticker="onRotate"
      />
      <LetterStoryDock
        :active-tool="activeTool"
        @toggle="onTool"
      />
    </div>

    <LetterStorySendSheet
      v-model:open="sendOpen"
      v-model:recipient="recipient"
      v-model:tour-stop="tourStop"
      v-model:sender-name="senderName"
      v-model:sender-email="senderEmail"
      v-model:visibility="visibility"
      :design="design"
      :body="body"
      :can-submit="canSubmit"
      :submitting="submitting"
      :submit-error="submitError"
      :sender-name-max="limits.senderNameMax"
      @submit="submit"
    />
  </div>
</template>
