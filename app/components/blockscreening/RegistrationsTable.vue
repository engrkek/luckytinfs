<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { BlockscreeningRegistration } from '~/composables/useBlockscreeningRegistrations'

const { registrations } = defineProps<{ registrations: BlockscreeningRegistration[] }>()

const { mutateAsync: togglePaid } = useToggleBlockscreeningPaid()
const { mutateAsync: updateSeatOptionMutation } = useUpdateBlockscreeningSeatOption()
const { mutateAsync: updatePaymentReceiverMutation } = useUpdateBlockscreeningPaymentReceiver()
const { mutateAsync: sendPaymentEmail } = useSendBlockscreeningPaymentEmail()
const { mutateAsync: sendConfirmationEmail } = useSendBlockscreeningConfirmationEmail()

// pinia-colada mutations are shared/global; these track which specific row is in flight for its spinner.
const togglingPaymentId = ref<string | null>(null)
const updatingSeatOptionId = ref<string | null>(null)
const updatingPaymentReceiverId = ref<string | null>(null)
const sendingEmailId = ref<string | null>(null)
const sendingConfirmationId = ref<string | null>(null)

// Session-lifetime "sent" tracking (resets on reload, matches original behavior).
const sentPaymentEmails = ref<Set<string>>(new Set())
const sentConfirmations = ref<Set<string>>(new Set())

async function onTogglePaid(registration: BlockscreeningRegistration) {
  togglingPaymentId.value = registration.id
  try {
    await togglePaid({ registration, paid: !registration.paid })
  }
  catch {
    // Already surfaced via the mutation's onError toast + rollback.
  }
  finally {
    togglingPaymentId.value = null
  }
}

async function onUpdateSeatOption(registration: BlockscreeningRegistration, newOption: string) {
  if (registration.childRegistration === newOption)
    return
  updatingSeatOptionId.value = registration.id
  try {
    await updateSeatOptionMutation({ registration, childRegistration: newOption })
  }
  catch {
    // Already surfaced via the mutation's onError toast + rollback.
  }
  finally {
    updatingSeatOptionId.value = null
  }
}

async function onUpdatePaymentReceiver(registration: BlockscreeningRegistration, newReceiver: string) {
  if (registration.paymentReceiver === newReceiver)
    return
  updatingPaymentReceiverId.value = registration.id
  try {
    await updatePaymentReceiverMutation({ registration, paymentReceiver: newReceiver || null })
  }
  catch {
    // Already surfaced via the mutation's onError toast + rollback.
  }
  finally {
    updatingPaymentReceiverId.value = null
  }
}

async function onSendPaymentEmail(registration: BlockscreeningRegistration) {
  if (registration.paid)
    return
  // eslint-disable-next-line no-alert
  if (!confirm(`Send payment instructions email to ${registration.fullName} (${registration.email})?`))
    return
  sendingEmailId.value = registration.id
  try {
    await sendPaymentEmail(registration)
    sentPaymentEmails.value.add(registration.id)
  }
  catch {
    // Already surfaced via the mutation's onError toast.
  }
  finally {
    sendingEmailId.value = null
  }
}

async function onSendConfirmationEmail(registration: BlockscreeningRegistration) {
  if (!registration.paid)
    return
  // eslint-disable-next-line no-alert
  if (!confirm(`Send verified payment confirmation & admission pass to ${registration.fullName} (${registration.email})?`))
    return
  sendingConfirmationId.value = registration.id
  try {
    await sendConfirmationEmail(registration)
    sentConfirmations.value.add(registration.id)
  }
  catch {
    // Already surfaced via the mutation's onError toast.
  }
  finally {
    sendingConfirmationId.value = null
  }
}

const copiedId = ref<string | null>(null)
function copyToClipboard(uniqueId: string, text: string) {
  navigator.clipboard.writeText(text).then(() => {
    copiedId.value = uniqueId
    setTimeout(() => {
      copiedId.value = null
    }, 2000)
  })
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const columns: TableColumn<BlockscreeningRegistration>[] = [
  { accessorKey: 'id', header: 'ID', meta: { class: { td: 'font-mono font-bold' } } },
  { accessorKey: 'fullName', header: 'Attendee Info' },
  { accessorKey: 'email', header: 'Contact Details' },
  { accessorKey: 'primaryPlatform', header: 'Social Verification', meta: { class: { td: 'max-w-50 truncate' } } },
  { accessorKey: 'childRegistration', header: 'Seat Option' },
  { accessorKey: 'paid', header: 'Payment Status' },
  { accessorKey: 'paymentMode', header: 'Payment Mode' },
  { accessorKey: 'paymentReference', header: 'Payment Ref' },
  { accessorKey: 'paymentReceiver', header: 'Payment Receiver' },
  { accessorKey: 'createdAt', header: 'Registered At', meta: { class: { td: 'text-primary-200/60 font-mono' } } },
  { id: 'actions', header: 'Actions', meta: { class: { th: 'text-right', td: 'text-right' } } },
]
</script>

<template>
  <div class="space-y-4">
    <!-- DESKTOP TABULAR VIEW -->
    <div class="hidden lg:block overflow-hidden border border-primary-100/10 rounded-2xl bg-secondary-950/30 backdrop-blur-md">
      <UTable
        :data="registrations"
        :columns
        :ui="{
          root: 'overflow-x-auto',
          base: 'w-full text-left text-xs',
          thead: 'bg-secondary-950 text-primary-200/60 uppercase tracking-wider font-mono border-b border-primary-100/10',
          tbody: 'divide-y divide-primary-100/10 text-primary-100/95 font-sans',
          tr: 'hover:bg-primary-100/5 transition-colors',
          th: 'py-4 px-4 text-xs font-semibold text-left text-primary-200/60',
          td: 'py-4 px-4 text-xs whitespace-nowrap align-top',
        }"
      >
        <template #id-cell="{ row }">
          <div class="flex items-center gap-1.5">
            <span class="text-primary-300">{{ row.original.id }}</span>
            <button
              class="hover:text-primary-300 transition-colors p-0.5 text-primary-100/30"
              title="Copy Pass ID"
              @click="copyToClipboard(row.original.id, row.original.id)"
            >
              <UIcon :name="copiedId === row.original.id ? 'ph:check-bold' : 'ph:copy'" class="size-3.5" />
            </button>
          </div>
        </template>

        <template #fullName-cell="{ row }">
          <div class="font-medium text-primary-50 text-sm leading-tight">
            {{ row.original.fullName }}
          </div>
          <div class="text-[10px] text-primary-200/50 mt-0.5">
            As: "{{ row.original.nickname }}"
          </div>
        </template>

        <template #email-cell="{ row }">
          <div class="flex items-center gap-1">
            <span class="text-primary-200/80">{{ row.original.email }}</span>
            <button
              class="hover:text-primary-300 transition-colors p-0.5 text-primary-100/30"
              title="Copy Email"
              @click="copyToClipboard(`${row.original.id}-email`, row.original.email)"
            >
              <UIcon :name="copiedId === `${row.original.id}-email` ? 'ph:check-bold' : 'ph:copy'" class="size-3" />
            </button>
          </div>
          <div class="flex items-center gap-1 mt-0.5 text-[10px] text-primary-200/50">
            <span>{{ row.original.mobile }}</span>
            <button
              class="hover:text-primary-300 transition-colors p-0.5 text-primary-100/20"
              title="Copy Mobile"
              @click="copyToClipboard(`${row.original.id}-mobile`, row.original.mobile)"
            >
              <UIcon :name="copiedId === `${row.original.id}-mobile` ? 'ph:check-bold' : 'ph:copy'" class="size-2.5" />
            </button>
          </div>
        </template>

        <template #primaryPlatform-cell="{ row }">
          <div class="flex items-center gap-1">
            <span class="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary-100/10 text-primary-300">{{ row.original.primaryPlatform }}</span>
            <span class="font-medium truncate text-primary-100" :title="row.original.primaryUsername">{{ row.original.primaryUsername }}</span>
          </div>
          <div v-if="row.original.otherPlatform" class="flex items-center gap-1 mt-1 text-[10px] text-primary-200/50">
            <span class="capitalize">{{ row.original.otherPlatform }}:</span>
            <span class="truncate" :title="row.original.otherUsername">{{ row.original.otherUsername }}</span>
          </div>
        </template>

        <template #childRegistration-cell="{ row }">
          <div class="relative inline-block">
            <select
              :value="row.original.childRegistration"
              :disabled="updatingSeatOptionId === row.original.id"
              class="appearance-none font-sans text-xs font-semibold rounded-lg pl-2.5 pr-7 py-1.5 border transition-all cursor-pointer focus:outline-none focus:ring-1"
              :class="[
                (row.original.childRegistration === 'sponsor_two' || row.original.childRegistration === 'sponsor_2')
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 focus:ring-amber-400'
                  : (row.original.childRegistration === 'sponsor' || row.original.childRegistration === 'sponsor_one')
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 focus:ring-emerald-400'
                    : 'bg-blue-500/15 text-blue-300 border-blue-500/30 focus:ring-blue-400',
                updatingSeatOptionId === row.original.id && 'opacity-50 cursor-wait',
              ]"
              @change="onUpdateSeatOption(row.original, ($event.target as HTMLSelectElement).value)"
            >
              <option value="sponsor" class="bg-secondary-950 text-primary-100">
                🐥 Sponsor 1 child
              </option>
              <option value="sponsor_two" class="bg-secondary-950 text-primary-100">
                🐥🐥 Sponsor 2 children
              </option>
              <option value="bring" class="bg-secondary-950 text-primary-100">
                🎒 Bring own child
              </option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-primary-200/50">
              <UIcon v-if="updatingSeatOptionId === row.original.id" name="ph:circle-notch" class="size-3 animate-spin text-primary-300" />
              <UIcon v-else name="ph:caret-down-bold" class="size-2.5" />
            </div>
          </div>
          <div v-if="row.original.childRegistration === 'bring' && row.original.minorName" class="text-[10px] text-primary-200/50 mt-1 truncate max-w-[140px]" :title="`${row.original.minorName} (${row.original.relationship || 'Child'})`">
            Child: {{ row.original.minorName }}
          </div>
        </template>

        <template #paid-cell="{ row }">
          <button
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-all hover:scale-105 active:scale-95 cursor-pointer"
            :class="row.original.paid ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border-rose-500/30'"
            :disabled="togglingPaymentId === row.original.id"
            title="Click to toggle Payment Status"
            @click="onTogglePaid(row.original)"
          >
            <UIcon v-if="togglingPaymentId === row.original.id" name="ph:circle-notch" class="size-3 animate-spin" />
            <span v-else class="size-1.5 rounded-full" :class="row.original.paid ? 'bg-emerald-400' : 'bg-rose-400 animate-pulse'" />
            <span>{{ row.original.paid ? 'PAID 💳' : 'UNPAID ⏳' }}</span>
          </button>
        </template>

        <template #paymentMode-cell="{ row }">
          <span
            v-if="row.original.paymentMode"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-primary-100/10 text-primary-200 border border-primary-100/15"
          >
            <UIcon name="ph:credit-card" class="size-3 text-primary-300" />
            {{ row.original.paymentMode }}
          </span>
          <span v-else class="text-primary-100/30 font-mono text-xs italic">
            None
          </span>
        </template>

        <template #paymentReference-cell="{ row }">
          <div v-if="row.original.paymentReference" class="flex items-center gap-1.5 font-mono text-xs">
            <span class="text-primary-100 bg-secondary-900/80 px-2 py-0.5 rounded border border-primary-100/10">{{ row.original.paymentReference }}</span>
            <button
              class="hover:text-primary-300 transition-colors p-0.5 text-primary-100/30"
              title="Copy Reference"
              @click="copyToClipboard(`${row.original.id}-ref`, row.original.paymentReference!)"
            >
              <UIcon :name="copiedId === `${row.original.id}-ref` ? 'ph:check-bold' : 'ph:copy'" class="size-3" />
            </button>
          </div>
          <span v-else class="text-primary-100/30 font-mono text-xs italic">
            None
          </span>
        </template>

        <template #paymentReceiver-cell="{ row }">
          <div class="relative inline-block">
            <select
              :value="row.original.paymentReceiver || ''"
              :disabled="updatingPaymentReceiverId === row.original.id || !row.original.hasPaymentEntry"
              class="appearance-none font-sans text-xs font-semibold rounded-lg pl-2.5 pr-7 py-1.5 border transition-all cursor-pointer focus:outline-none focus:ring-1 bg-primary-100/10 text-primary-200 border-primary-100/15 focus:ring-primary-300"
              :class="updatingPaymentReceiverId === row.original.id && 'opacity-50 cursor-wait'"
              :title="row.original.hasPaymentEntry ? 'Select payment receiver' : 'No payment record exists for this ID'"
              @change="onUpdatePaymentReceiver(row.original, ($event.target as HTMLSelectElement).value)"
            >
              <option value="" class="bg-secondary-950 text-primary-100">
                None
              </option>
              <option value="Kek" class="bg-secondary-950 text-primary-100">
                Kek
              </option>
              <option value="Min" class="bg-secondary-950 text-primary-100">
                Min
              </option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-primary-200/50">
              <UIcon v-if="updatingPaymentReceiverId === row.original.id" name="ph:circle-notch" class="size-3 animate-spin text-primary-300" />
              <UIcon v-else name="ph:caret-down-bold" class="size-2.5" />
            </div>
          </div>
        </template>

        <template #createdAt-cell="{ row }">
          {{ formatDate(row.original.createdAt) }}
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center justify-end gap-1.5">
            <UButton
              size="xs"
              variant="subtle"
              color="primary"
              icon="ph:paper-plane-tilt"
              :disabled="row.original.paid || sendingEmailId === row.original.id"
              :loading="sendingEmailId === row.original.id"
              :class="row.original.paid && 'opacity-25 cursor-not-allowed pointer-events-none'"
              :title="row.original.paid ? 'Payment already completed (Payment link blocked)' : (sentPaymentEmails.has(row.original.id) ? 'Payment link sent' : 'Send payment link instructions email')"
              @click="onSendPaymentEmail(row.original)"
            >
              {{ sentPaymentEmails.has(row.original.id) ? 'Sent ✓' : 'Payment' }}
            </UButton>
            <UButton
              size="xs"
              variant="subtle"
              color="emerald"
              icon="ph:seal-check-fill"
              :disabled="!row.original.paid || sendingConfirmationId === row.original.id || sentConfirmations.has(row.original.id)"
              :loading="sendingConfirmationId === row.original.id"
              :class="(!row.original.paid || sentConfirmations.has(row.original.id)) && 'opacity-25 cursor-not-allowed pointer-events-none'"
              :title="!row.original.paid ? 'Mark as PAID to unlock confirmation email' : (sentConfirmations.has(row.original.id) ? 'Confirmation pass already sent' : 'Send verified payment and event admission ticket email')"
              @click="onSendConfirmationEmail(row.original)"
            >
              {{ sentConfirmations.has(row.original.id) ? 'Sent ✓' : 'Confirm' }}
            </UButton>
          </div>
        </template>
      </UTable>
    </div>

    <!-- MOBILE / RESPONSIVE CARD VIEW -->
    <div class="lg:hidden space-y-4">
      <div
        v-for="r in registrations"
        :key="r.id"
        class="rip bg-paper text-secondary-950 shadow-lg border border-[#f0e6d0] rounded-xl overflow-hidden"
      >
        <!-- Ticket small striped accent top -->
        <div class="h-2 bg-gingham-yellow-blue w-full" />

        <div class="p-4 space-y-4">
          <!-- Ticket Row 1: ID & Date -->
          <div class="flex items-center justify-between gap-2 border-b border-[#ebdcb3]/60 pb-2">
            <div class="flex items-center gap-1.5">
              <span class="font-mono font-bold text-sm tracking-wide text-secondary-900">{{ r.id }}</span>
              <button
                class="text-secondary-400 hover:text-secondary-600 transition-colors p-0.5"
                @click="copyToClipboard(`${r.id}-mob`, r.id)"
              >
                <UIcon :name="copiedId === `${r.id}-mob` ? 'ph:check-bold' : 'ph:copy'" class="size-4" />
              </button>
            </div>
            <span class="text-[10px] text-secondary-500 font-mono">{{ formatDate(r.createdAt) }}</span>
          </div>

          <!-- Row 2: Registrant and Contact Details -->
          <div class="space-y-1">
            <h4 class="font-display font-bold text-base text-secondary-900 leading-tight">
              {{ r.fullName }}
              <span class="text-xs font-normal text-secondary-500 font-sans">({{ r.nickname }})</span>
            </h4>
            <div class="text-xs text-secondary-700 space-y-0.5">
              <p class="flex items-center gap-1">
                <UIcon name="ph:envelope-simple" />
                <span>{{ r.email }}</span>
              </p>
              <p class="flex items-center gap-1">
                <UIcon name="ph:phone" />
                <span>{{ r.mobile }}</span>
              </p>
            </div>
          </div>

          <!-- Row 3: Social handle & Seats -->
          <div class="grid grid-cols-2 gap-2 bg-[#ebdcb3]/20 border border-[#ebdcb3]/40 p-2.5 rounded-lg text-xs">
            <div>
              <span class="font-bold text-[9px] uppercase tracking-wider text-secondary-500 block mb-1">Social Handle</span>
              <span class="font-medium font-mono text-secondary-800 bg-[#ebdcb3]/30 px-1 py-0.5 rounded text-[11px]">
                {{ r.primaryPlatform }}: {{ r.primaryUsername }}
              </span>
              <span v-if="r.otherPlatform" class="block text-[10px] text-secondary-500 mt-1 truncate">
                {{ r.otherPlatform }}: {{ r.otherUsername }}
              </span>
            </div>

            <div>
              <span class="font-bold text-[9px] uppercase tracking-wider text-secondary-500 block mb-1">Pass Inclusion</span>
              <div class="relative inline-block w-full">
                <select
                  :value="r.childRegistration"
                  :disabled="updatingSeatOptionId === r.id"
                  class="w-full appearance-none font-sans text-xs font-bold rounded-lg pl-2 pr-6 py-1 border transition-all cursor-pointer focus:outline-none"
                  :class="[
                    (r.childRegistration === 'sponsor_two' || r.childRegistration === 'sponsor_2')
                      ? 'bg-amber-50 text-amber-900 border-amber-300'
                      : (r.childRegistration === 'sponsor' || r.childRegistration === 'sponsor_one')
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                        : 'bg-blue-50 text-blue-900 border-blue-300',
                    updatingSeatOptionId === r.id && 'opacity-50 cursor-wait',
                  ]"
                  @change="onUpdateSeatOption(r, ($event.target as HTMLSelectElement).value)"
                >
                  <option value="sponsor">
                    🐥 Sponsor 1 child
                  </option>
                  <option value="sponsor_two">
                    🐥🐥 Sponsor 2 children
                  </option>
                  <option value="bring">
                    🎒 Bring own child
                  </option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-secondary-600">
                  <UIcon v-if="updatingSeatOptionId === r.id" name="ph:circle-notch" class="size-3 animate-spin text-secondary-700" />
                  <UIcon v-else name="ph:caret-down-bold" class="size-2.5" />
                </div>
              </div>
              <span v-if="r.childRegistration === 'bring' && r.minorName" class="block text-[10px] text-secondary-600 font-medium mt-1 truncate" :title="r.minorName">
                {{ r.minorName }} ({{ r.relationship || 'Child' }})
              </span>
            </div>
          </div>

          <!-- Row 4: Payment Submission Details -->
          <div class="bg-[#ebdcb3]/20 border border-[#ebdcb3]/40 p-2.5 rounded-lg text-xs space-y-1">
            <div class="flex items-center justify-between">
              <span class="font-bold text-[9px] uppercase tracking-wider text-secondary-500">Payment Submission</span>
              <span v-if="r.paymentMode" class="font-mono text-[10px] font-bold bg-[#ebdcb3]/40 px-1.5 py-0.5 rounded text-secondary-900">
                {{ r.paymentMode }}
              </span>
              <span v-else class="text-[10px] text-secondary-400 italic">None</span>
            </div>

            <div class="flex items-center justify-between pt-1">
              <span class="text-[10px] text-secondary-600">Reference:</span>
              <div v-if="r.paymentReference" class="flex items-center gap-1 font-mono text-xs font-semibold text-secondary-900">
                <span>{{ r.paymentReference }}</span>
                <button
                  class="text-secondary-400 hover:text-secondary-600 p-0.5"
                  @click="copyToClipboard(`${r.id}-mob-ref`, r.paymentReference!)"
                >
                  <UIcon :name="copiedId === `${r.id}-mob-ref` ? 'ph:check-bold' : 'ph:copy'" class="size-3" />
                </button>
              </div>
              <span v-else class="text-[10px] text-secondary-400 italic">None</span>
            </div>

            <div class="flex items-center justify-between pt-1">
              <span class="text-[10px] text-secondary-600">Receiver:</span>
              <div class="relative inline-block">
                <select
                  :value="r.paymentReceiver || ''"
                  :disabled="updatingPaymentReceiverId === r.id || !r.hasPaymentEntry"
                  class="appearance-none font-sans text-[10px] font-bold rounded-lg pl-2 pr-6 py-1 border transition-all cursor-pointer focus:outline-none bg-[#ebdcb3]/40 text-secondary-900 border-[#ebdcb3] focus:ring-1 focus:ring-secondary-500"
                  :class="updatingPaymentReceiverId === r.id && 'opacity-50 cursor-wait'"
                  :title="r.hasPaymentEntry ? 'Select payment receiver' : 'No payment record exists for this ID'"
                  @change="onUpdatePaymentReceiver(r, ($event.target as HTMLSelectElement).value)"
                >
                  <option value="">
                    None
                  </option>
                  <option value="Kek">
                    Kek
                  </option>
                  <option value="Min">
                    Min
                  </option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-secondary-600">
                  <UIcon v-if="updatingPaymentReceiverId === r.id" name="ph:circle-notch" class="size-3 animate-spin text-secondary-700" />
                  <UIcon v-else name="ph:caret-down-bold" class="size-2" />
                </div>
              </div>
            </div>
          </div>

          <!-- Row 5: Payment Toggle and Send Email Buttons -->
          <div class="pt-2 border-t border-[#ebdcb3]/60 flex flex-wrap items-center justify-between gap-2">
            <button
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer"
              :class="r.paid ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-rose-50 text-rose-800 border-rose-300'"
              :disabled="togglingPaymentId === r.id"
              @click="onTogglePaid(r)"
            >
              <UIcon v-if="togglingPaymentId === r.id" name="ph:circle-notch" class="size-3 animate-spin" />
              <span v-else class="size-2 rounded-full" :class="r.paid ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'" />
              <span>{{ r.paid ? 'PAID 💳' : 'UNPAID ⏳' }}</span>
            </button>

            <div class="flex items-center gap-1.5">
              <UButton
                size="xs"
                color="primary"
                icon="ph:paper-plane-tilt"
                class="text-secondary-950 font-bold"
                :disabled="r.paid || sendingEmailId === r.id"
                :loading="sendingEmailId === r.id"
                :class="r.paid && 'opacity-30 cursor-not-allowed pointer-events-none'"
                :title="r.paid ? 'Payment already completed (Payment link blocked)' : 'Send Payment Link Email'"
                @click="onSendPaymentEmail(r)"
              >
                {{ sentPaymentEmails.has(r.id) ? 'Sent ✓' : 'Payment' }}
              </UButton>
              <UButton
                size="xs"
                color="emerald"
                icon="ph:seal-check-fill"
                class="font-bold text-white"
                :disabled="!r.paid || sendingConfirmationId === r.id || sentConfirmations.has(r.id)"
                :loading="sendingConfirmationId === r.id"
                :class="(!r.paid || sentConfirmations.has(r.id)) && 'opacity-30 cursor-not-allowed pointer-events-none'"
                :title="!r.paid ? 'Mark as PAID to unlock confirmation pass' : (sentConfirmations.has(r.id) ? 'Confirmation pass sent' : 'Send Payment Confirmation & Pass Email')"
                @click="onSendConfirmationEmail(r)"
              >
                {{ sentConfirmations.has(r.id) ? 'Sent ✓' : 'Confirm' }}
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Beach rip ticket style */
.rip {
  background-image: radial-gradient(circle at 0px 50%, transparent 8px, #fdfbf7 8px),
                    radial-gradient(circle at 100% 50%, transparent 8px, #fdfbf7 8px);
  background-position: left, right;
  background-repeat: no-repeat;
}

/* Background grid styling for receipt borders */
.bg-gingham-yellow-blue {
  background-color: #ebdcb3;
  background-image:
    linear-gradient(90deg, rgba(31,64,114,0.1) 50%, transparent 50%),
    linear-gradient(rgba(31,64,114,0.1) 50%, transparent 50%);
  background-size: 16px 16px;
}
</style>
