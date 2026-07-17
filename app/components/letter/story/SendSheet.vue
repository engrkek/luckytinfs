<script setup lang="ts">
import type { LetterDesign, LetterRecipient, LetterVisibility } from '#shared/letters/types'
import { LETTER_RECIPIENTS } from '#shared/letters/assets'

defineProps<{
  open: boolean
  recipient: LetterRecipient | null
  senderName: string
  senderEmail: string
  visibility: LetterVisibility
  design: LetterDesign
  body: string
  canSubmit: boolean
  submitting: boolean
  submitError: string | null
  senderNameMax: number
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'update:recipient': [value: LetterRecipient | null]
  'update:senderName': [value: string]
  'update:senderEmail': [value: string]
  'update:visibility': [value: LetterVisibility]
  'submit': []
}>()

function close() {
  emit('update:open', false)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex flex-col justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="send-sheet-title"
    >
      <button
        type="button"
        class="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        aria-label="Close send sheet"
        @click="close"
      />

      <div class="relative z-1 max-h-[90dvh] overflow-y-auto rounded-t-2xl border border-white/10 bg-[#1e2634] text-[#e8e2d6] shadow-2xl">
        <div class="mx-auto mt-3 h-1 w-10 rounded-full bg-white/20" aria-hidden="true" />

        <div class="px-5 pt-4 pb-8 space-y-5">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 id="send-sheet-title" class="font-display text-xl font-medium tracking-tight text-[#f4efe4]">
                Send letter
              </h2>
              <p class="mt-1 text-sm text-[#c8bfb0]/70">
                Sealed &amp; waiting for moderation
              </p>
            </div>
            <button
              type="button"
              class="font-type text-[0.65rem] uppercase tracking-[0.16em] text-[#c8bfb0]/55"
              @click="close"
            >
              Close
            </button>
          </div>

          <!-- sealed envelope + wax preview -->
          <div class="flex justify-center py-2">
            <LetterEnvelope
              :recipient="recipient ?? 'bini'"
              :sender-name="senderName"
              :design="design"
              :open="false"
              :interactive="false"
              class="w-full !max-w-xs"
            />
          </div>

          <!-- recipient -->
          <div>
            <p class="font-type text-[0.6rem] uppercase tracking-[0.2em] text-[#c8bfb0]/55 mb-2">
              To
            </p>
            <div class="flex gap-2">
              <button
                v-for="r in LETTER_RECIPIENTS"
                :key="r.id"
                type="button"
                class="flex-1 rounded-xl border py-2.5 font-display text-sm transition-colors"
                :class="recipient === r.id
                  ? 'border-[#e0c56a] bg-white/10 text-[#f4efe4]'
                  : 'border-white/10 bg-white/5 text-[#c8bfb0]'"
                @click="emit('update:recipient', r.id)"
              >
                {{ r.label }}
              </button>
            </div>
          </div>

          <!-- visibility -->
          <div>
            <p class="font-type text-[0.6rem] uppercase tracking-[0.2em] text-[#c8bfb0]/55 mb-2">
              Visibility
            </p>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                class="rounded-xl border p-3 text-left transition-colors"
                :class="visibility === 'public'
                  ? 'border-[#e0c56a] bg-white/10'
                  : 'border-white/10 bg-white/5'"
                @click="emit('update:visibility', 'public')"
              >
                <span class="block font-medium text-[#f4efe4] text-sm">Public</span>
                <span class="mt-0.5 block text-xs text-[#c8bfb0]/65">May appear in the daily feed</span>
              </button>
              <button
                type="button"
                class="rounded-xl border p-3 text-left transition-colors"
                :class="visibility === 'private'
                  ? 'border-[#e0c56a] bg-white/10'
                  : 'border-white/10 bg-white/5'"
                @click="emit('update:visibility', 'private')"
              >
                <span class="block font-medium text-[#f4efe4] text-sm">Private</span>
                <span class="mt-0.5 block text-xs text-[#c8bfb0]/65">Only for the recipient</span>
              </button>
            </div>
          </div>

          <!-- identity -->
          <div class="space-y-3">
            <label class="block">
              <span class="font-type text-[0.6rem] uppercase tracking-[0.2em] text-[#c8bfb0]/55">
                Your name (optional)
              </span>
              <input
                :value="senderName"
                type="text"
                :maxlength="senderNameMax"
                placeholder="Anonymous"
                class="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-[#f4efe4] placeholder:text-[#c8bfb0]/35 outline-none focus:border-[#e0c56a]/50"
                @input="emit('update:senderName', ($event.target as HTMLInputElement).value)"
              >
            </label>
            <label class="block">
              <span class="font-type text-[0.6rem] uppercase tracking-[0.2em] text-[#c8bfb0]/55">
                Email (optional, never shown)
              </span>
              <input
                :value="senderEmail"
                type="email"
                placeholder="contact only"
                class="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-[#f4efe4] placeholder:text-[#c8bfb0]/35 outline-none focus:border-[#e0c56a]/50"
                @input="emit('update:senderEmail', ($event.target as HTMLInputElement).value)"
              >
            </label>
          </div>

          <p v-if="!body.trim()" class="text-sm text-amber-200/80">
            Your letter is empty — go back and write something.
          </p>
          <p v-if="!recipient" class="text-sm text-amber-200/80">
            Pick who this letter is for.
          </p>
          <p v-if="submitError" class="text-sm text-red-300" role="alert">
            {{ submitError }}
          </p>

          <button
            type="button"
            class="w-full rounded-full bg-[#e0c56a] py-3.5 font-display text-base font-medium text-[#1a2230] transition-opacity disabled:opacity-40"
            :disabled="!canSubmit || submitting"
            @click="emit('submit')"
          >
            {{ submitting ? 'Sending…' : 'Seal & send' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
