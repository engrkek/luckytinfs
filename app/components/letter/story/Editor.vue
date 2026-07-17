<script setup lang="ts">
import type { LetterStoryTool } from '~/composables/useLetterEditor'
import { LETTER_RECIPIENTS } from '#shared/letters/assets'
import { RECIPIENT_THEME } from '#shared/letters/visuals'

const editor = useLetterEditor()
const {
  recipient,
  senderName,
  senderEmail,
  body,
  visibility,
  design,
  activeTool,
  selectedSticker,
  editingText,
  sendOpen,
  canSubmit,
  toggleTool,
  closeTool,
  addSticker,
  removeSticker,
  updateSticker,
  submit,
  submitting,
  submitError,
  submittedId,
  reset,
  limits,
} = editor

function openSend() {
  closeTool()
  editingText.value = false
  selectedSticker.value = null
  sendOpen.value = true
}

function onMoveSticker(index: number, pos: { x: number, y: number }) {
  updateSticker(index, pos)
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
const theme = computed(() =>
  recipient.value ? RECIPIENT_THEME[recipient.value] : null,
)
</script>

<template>
  <!-- Success -->
  <div
    v-if="submittedId"
    class="mailbox-desk flex min-h-dvh flex-col items-center justify-center px-6 text-center"
  >
    <div class="relative z-1 max-w-sm space-y-4">
      <LetterWaxSeal :seal-id="design.seal" size="lg" class="mx-auto" />
      <h1 class="font-display text-2xl font-medium tracking-tight text-[#f4efe4]">
        Letter sealed
      </h1>
      <p class="text-sm text-[#c8bfb0]/80 text-pretty leading-relaxed">
        It’s on its way to the magical mailbox. Moderators will review it before it can appear in a daily feed.
      </p>
      <p class="font-type text-[0.6rem] uppercase tracking-[0.18em] text-[#c8bfb0]/40">
        {{ submittedId }}
      </p>
      <div class="flex flex-col gap-2 pt-2">
        <button
          type="button"
          class="rounded-full bg-[#e0c56a] px-6 py-3 font-display font-medium text-[#1a2230]"
          @click="reset"
        >
          Write another
        </button>
        <NuxtLink
          :to="recipient ? `/mailbox/${recipient}` : '/mailbox'"
          class="rounded-full border border-white/15 px-6 py-3 font-type text-[0.7rem] uppercase tracking-[0.18em] text-[#c8bfb0]/80"
        >
          Open mailbox
        </NuxtLink>
      </div>
    </div>
  </div>

  <!-- Story editor stage -->
  <div
    v-else
    class="letter-story-stage fixed inset-0 z-40 flex flex-col bg-[#121820] text-[#e8e2d6]"
  >
    <!-- Top chrome -->
    <header class="relative z-20 flex items-center justify-between gap-3 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
      <NuxtLink
        to="/mailbox"
        class="grid size-10 place-items-center rounded-full bg-black/35 text-[#f4efe4] backdrop-blur-sm"
        aria-label="Close editor"
      >
        <UIcon name="i-lucide-x" class="size-5" />
      </NuxtLink>

      <!-- recipient chips -->
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

    <!-- Canvas stage (scrollable) -->
    <div
      class="relative z-10 flex-1 overflow-y-auto overscroll-contain px-3 pb-2 sm:px-6"
      @pointerdown="selectedSticker = null"
    >
      <div class="mx-auto max-w-md py-2">
        <LettersStoryCanvas
          :recipient="recipient"
          :sender-name="senderName"
          :design="design"
          :body="body"
          :editing-text="editingText"
          :selected-sticker="selectedSticker"
          :body-max="limits.bodyMax"
          @update:body="body = $event"
          @update:editing-text="editingText = $event"
          @select-sticker="selectedSticker = $event"
          @move-sticker="onMoveSticker"
        />

        <p class="mt-2 text-center font-type text-[0.55rem] uppercase tracking-[0.16em] text-white/30">
          {{ bodyCount }}/{{ limits.bodyMax }}
          <span v-if="theme"> · {{ theme.postmark }}</span>
        </p>
      </div>
    </div>

    <!-- Bottom chrome: tray + dock -->
    <div class="relative z-20 border-t border-white/10 bg-[#121820]/95 backdrop-blur-md pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <LettersStoryTray
        v-if="activeTool"
        :tool="activeTool"
        :design="design"
        :selected-sticker="selectedSticker"
        @close="closeTool"
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
      <LettersStoryDock
        :active-tool="activeTool"
        @toggle="onTool"
      />
    </div>

    <LettersStorySendSheet
      v-model:open="sendOpen"
      v-model:recipient="recipient"
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
