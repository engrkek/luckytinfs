<script setup lang="ts">
import type { TourStopId } from '#shared/letters/tour'
import type { LetterDesign, LetterRecipient, LetterVisibility } from '#shared/letters/types'
import { LETTER_RECIPIENTS } from '#shared/letters/assets'
import { TOUR_STOPS } from '#shared/letters/tour'

defineProps<{
  open: boolean
  recipient: LetterRecipient | null
  tourStop: TourStopId
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
  'update:tourStop': [value: TourStopId]
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
  <UDrawer
    :open="open"
    :handle="false"
    title="Send letter"
    description="Sealed & waiting for moderation"
    :ui="{
      overlay: 'bg-black/55 backdrop-blur-[2px]',
      content: 'max-h-[90dvh] rounded-t-2xl border border-white/10 bg-[#1e2634] text-[#e8e2d6] shadow-2xl ring-0 sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-lg sm:-translate-x-1/2',
    }"
    @update:open="emit('update:open', $event)"
  >
    <template #content>
      <div class="overflow-y-auto">
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
              class="w-full max-w-xs!"
            />
          </div>

          <!-- recipient -->
          <div>
            <p class="font-type text-xs uppercase tracking-[0.2em] text-[#c8bfb0]/55 mb-2">
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

          <!-- tour stop -->
          <div>
            <p class="font-type text-xs uppercase tracking-[0.2em] text-[#c8bfb0]/55 mb-2">
              For which show
            </p>
            <select
              :value="tourStop"
              class="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-[#f4efe4] outline-none focus:border-jhoanna-400/60"
              @change="emit('update:tourStop', ($event.target as HTMLSelectElement).value as TourStopId)"
            >
              <option
                v-for="s in TOUR_STOPS"
                :key="s.id"
                :value="s.id"
                class="bg-[#1e2634]"
              >
                {{ s.city }}{{ s.date ? ` — ${s.date}` : '' }}
              </option>
            </select>
            <p class="mt-1.5 text-xs text-[#c8bfb0]/55">
              Your letter travels with this stop of the tour.
            </p>
          </div>

          <!-- visibility -->
          <div>
            <p class="font-type text-xs uppercase tracking-[0.2em] text-[#c8bfb0]/55 mb-2">
              Visibility
            </p>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                class="rounded-xl border p-3 text-left transition-colors"
                :class="visibility === 'public'
                  ? 'border-jhoanna-400 bg-jhoanna-400/10'
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
                  ? 'border-jhoanna-400 bg-jhoanna-400/10'
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
              <span class="font-type text-xs uppercase tracking-[0.2em] text-[#c8bfb0]/55">
                Your name (optional)
              </span>
              <input
                :value="senderName"
                type="text"
                :maxlength="senderNameMax"
                placeholder="Anonymous"
                class="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-[#f4efe4] placeholder:text-[#c8bfb0]/35 outline-none focus:border-jhoanna-400/60"
                @input="emit('update:senderName', ($event.target as HTMLInputElement).value)"
              >
            </label>
            <label class="block">
              <span class="font-type text-xs uppercase tracking-[0.2em] text-[#c8bfb0]/55">
                Email (optional, never shown)
              </span>
              <input
                :value="senderEmail"
                type="email"
                placeholder="contact only"
                class="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-[#f4efe4] placeholder:text-[#c8bfb0]/35 outline-none focus:border-jhoanna-400/60"
                @input="emit('update:senderEmail', ($event.target as HTMLInputElement).value)"
              >
            </label>
          </div>

          <!-- house rules -->
          <div class="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <p class="font-type text-xs uppercase tracking-[0.2em] text-[#c8bfb0]/55 mb-1.5">
              Before you send
            </p>
            <ul class="list-disc space-y-1 pl-4 text-sm leading-relaxed text-[#c8bfb0]/75">
              <li>Every letter is reviewed before it can appear publicly.</li>
              <li>Keep it kind. Strictly no hate, harassment, or inappropriate language.</li>
              <li>Don't share personal details like addresses or phone numbers.</li>
              <li>Letters that break these rules won't be delivered.</li>
            </ul>
          </div>

          <p v-if="!body.trim()" class="text-sm text-amber-200/80">
            Your letter is empty — go back and write something.
          </p>
          <p v-if="!recipient" class="text-sm text-amber-200/80">
            Pick who this letter is for.
          </p>
          <p v-if="design.format === 'postcard' && !design.photo" class="text-sm text-amber-200/80">
            Your postcard needs a front photo — add one from the Card tool.
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
    </template>
  </UDrawer>
</template>
