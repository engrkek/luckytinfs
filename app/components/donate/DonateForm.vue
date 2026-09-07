<script setup lang="ts">
import type { FormSubmitEvent, SelectItem } from '@nuxt/ui'
import type { Campaign, Channel } from '#shared/types'
import { z } from 'zod'

const { data: campaigns } = await useFetch<Campaign[]>('/api/campaigns')
const { data: channels } = await useFetch<Channel[]>('/api/channels')

const STEPS = [
  { title: 'Cause', fields: ['amount'] as const, disabled: true },
  { title: 'Your Info', fields: ['handle', 'social', 'email', 'name'] as const, disabled: true },
  { title: 'Payment', fields: ['channelId'] as const, disabled: true },
]
const AMOUNT_PRESETS = [100, 300, 500, 1000]

const socials: SelectItem[] = [
  { value: 'x', label: 'X / Twitter' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'reddit', label: 'Reddit' },
  { value: 'threads', label: 'Threads' },
]

const displayOptions = [
  { value: 'both', label: 'Name & handle' },
  { value: 'handle_only', label: 'Handle only' },
  { value: 'name_only', label: 'Name only' },
  { value: 'anon', label: 'Anonymous' },
]

const schema = z.object({
  campaignId: z.string().optional(),
  amount: z.number('Enter an amount').positive('Enter an amount above ₱0'),
  name: z.string().optional(),
  handle: z.string('Enter a handle or name').min(1, 'Enter a handle or name we can reach you by'),
  social: z.string('Choose where').min(1, 'Choose where we can find you'),
  email: z.email('Enter a valid email'),
  display: z.enum(['both', 'handle_only', 'name_only', 'anon']),
  channelId: z.string('Choose a payment method').min(1, 'Choose a payment method'),
  refNo: z.string('Enter your reference number').min(1, 'Enter your reference number'),
  donorNotes: z.string().optional(),
}).refine(data => (data.display !== 'both' && data.display !== 'name_only') || !!data.name?.trim(), {
  message: 'Enter your name, or choose a different credit option',
  path: ['name'],
})
type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({ display: 'both' })

const causeItems = computed(() => [
  { value: '__general', label: 'Wherever it\'s needed most', description: 'We\'ll route it to whatever\'s next on the list.' },
  ...(campaigns.value ?? []).map(c => ({ value: c.id, label: c.title, description: c.description ?? undefined, image: c.imageUrls?.[0] })),
])
const causeValue = computed({
  get: () => state.campaignId ?? '__general',
  set: (v: string) => { state.campaignId = v === '__general' ? undefined : v },
})

// URadioGroup stringifies primitive items (AMOUNT_PRESETS), but state.amount must stay a number for the schema
const amountPreset = computed({
  get: () => state.amount != null ? String(state.amount) : undefined,
  set: (v: string) => { state.amount = Number(v) },
})

const channelItems = computed(() => (channels.value ?? []).map(c => ({
  value: c.id,
  label: c.nickname ? `${c.nickname} (${c.accountName})` : `${c.type} (${c.accountName})`,
  description: c.accountIdentifier,
})))
const selectedChannel = computed(() => channels.value?.find(c => c.id === state.channelId))

const step = ref(0)
const form = useTemplateRef('form')
const proof = ref<File | null>(null)
const proofError = ref('')
const submitted = ref(false)
const toast = useToast()

async function next() {
  const ok = await form.value?.validate({ name: [...STEPS[step.value]!.fields], silent: true })
  if (!ok)
    return
  step.value++
}

function back() {
  step.value--
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (!proof.value) {
    proofError.value = 'Attach a screenshot of your payment'
    return
  }
  proofError.value = ''

  try {
    const body = new FormData()
    body.append('proof', proof.value)
    const { pathname } = await $fetch<{ pathname: string }>('/api/donations/proof', { method: 'POST', body })

    const { name, handle, social, email, ...rest } = event.data

    await $fetch('/api/donations', {
      method: 'POST',
      body: {
        ...rest,
        amount: Math.round(rest.amount * 100),
        proofUrl: `/images/${pathname}`,
        donor: { name, handle, social, email },
      },
    })

    submitted.value = true
  }
  catch (err) {
    const e = err as { data?: { statusMessage?: string }, message?: string }
    toast.add({
      icon: 'ph:x-circle',
      title: 'Couldn\'t send that',
      description: e.data?.statusMessage ?? e.message ?? 'Something went wrong — try again.',
      color: 'error',
    })
  }
}
</script>

<template>
  <div class="flex flex-col gap-10">
    <UStepper
      v-if="!submitted"
      v-model="step"
      :items="STEPS"
      color="primary"
      :disabled="true"
      :ui="{ title: 'text-white', description: 'text-white/70' }"
    />

    <UTheme
      :ui="{
        button: {
          base: 'text-base px-5 py-4 rounded-full',
        },
      }"
      :props="{
        button: { size: 'xl' },
        formField: { size: 'xl' },
      }"
    >
      <div class="rip bg-paper drop-shadow-xl px-6 py-10 sm:px-10 sm:py-12">
        <div v-if="submitted" class="space-y-4 py-6 text-center">
          <UIcon name="ph:check-circle" class="size-14 text-secondary-600" />
          <h2 class="font-display text-2xl text-secondary-950">
            Thank you, {{ state.name || state.handle }}!
          </h2>
          <p class="text-secondary-900/70 mx-auto max-w-sm text-pretty">
            Your ₱{{ (state.amount ?? 0).toLocaleString() }} donation is in the queue for review — we'll update the reports page once it's confirmed.
          </p>
          <UButton label="Back home" to="/" variant="soft" color="secondary" />
        </div>
        <UForm
          v-else
          ref="form"
          :schema
          :state
          class="space-y-6"
          @submit="onSubmit"
        >
          <div v-show="step === 0" class="space-y-6">
            <UFormField name="campaignId" label="Choose a cause">
              <URadioGroup
                v-model="causeValue"
                :items="causeItems"
                variant="card"
                value-key="value"
              >
                <template #label="{ item }">
                  <span class="inline-flex items-center gap-3">
                    <img v-if="item.image" :src="item.image" class="size-10 shrink-0 rounded object-cover align-middle">
                    <span class="font-medium">{{ item.label }}</span>
                  </span>
                </template>
              </URadioGroup>
            </UFormField>
            <UFormField name="amount" label="Amount">
              <URadioGroup
                v-model="amountPreset"
                :items="AMOUNT_PRESETS"
                indicator="hidden"
                variant="card"
                orientation="horizontal"
                :ui="{ fieldset: 'grid grid-cols-2 lg:grid-cols-4 gap-2', item: 'w-full' }"
              >
                <template #label="{ item }">
                  ₱{{ item.label }}
                </template>
              </URadioGroup>
              <UInputNumber
                v-model="state.amount"
                :min="1"
                :step="1"
                :step-snapping="false"
                :increment="false"
                :decrement="false"
                :format-options="{ style: 'currency', currency: 'PHP' }"
                size="xl"
                placeholder="Other amount"
                class="mt-4 w-full"
              />
            </UFormField>
            <UButton
              label="Continue"
              trailing-icon="ph:arrow-right"
              size="lg"
              block
              @click="next"
            />
          </div>
          <div v-show="step === 1" class="space-y-6">
            <UFormField name="name" label="Name" description="Only used if you choose to be credited by name below.">
              <UInput v-model="state.name" placeholder="e.g. Juana dela Cruz" />
            </UFormField>
            <div class="grid sm:grid-cols-2 gap-4">
              <UFormField name="social" label="Where can we find you?" required>
                <USelect
                  v-model="state.social"
                  :items="socials"
                  value-key="value"
                  placeholder="Choose a platform"
                  class="w-full"
                />
              </UFormField>
              <UFormField name="handle" label="Handle" required>
                <UInput v-model="state.handle" placeholder="@handle" />
              </UFormField>
            </div>
            <UFormField name="email" label="Email" required description="For updates on your donation, never shown publicly.">
              <UInput v-model="state.email" type="email" placeholder="you@email.com" />
            </UFormField>
            <UFormField name="display" label="Credit me as">
              <URadioGroup v-model="state.display" :items="displayOptions" value-key="value" variant="card" />
            </UFormField>
            <div class="flex gap-3">
              <UButton
                label="Back"
                variant="ghost"
                color="neutral"
                size="lg"
                @click="back"
              />
              <UButton
                label="Continue"
                trailing-icon="ph:arrow-right"
                size="lg"
                block
                @click="next"
              />
            </div>
          </div>
          <div v-show="step === 2" class="space-y-6">
            <UFormField name="channelId" label="Pay to">
              <URadioGroup
                v-model="state.channelId"
                :items="channelItems"
                variant="card"
                value-key="value"
                class="grid sm:grid-cols-2 gap-3"
              />
            </UFormField>
            <div v-if="selectedChannel" class="border-secondary-900/15 bg-secondary-50 flex items-center gap-4 rounded-md border p-4">
              <NuxtImg v-if="selectedChannel.qrUrl" :src="selectedChannel.qrUrl" class="size-24 shrink-0 rounded object-cover" />
              <div class="space-y-0.5 text-sm">
                <p class="font-bold text-highlighted">
                  {{ selectedChannel.accountName }}
                </p>
                <p class="text-secondary-900/70">
                  {{ selectedChannel.accountIdentifier }}
                </p>
              </div>
            </div>
            <UFormField name="refNo" label="Reference number" required>
              <UInput v-model="state.refNo" placeholder="From your payment confirmation" class="w-full" />
            </UFormField>
            <UFormField label="Payment screenshot" required :error="proofError || undefined">
              <UFileUpload v-model="proof" accept="image/*,.pdf" label="Drop your screenshot here" @update:model-value="proofError = ''" />
            </UFormField>
            <UFormField name="donorNotes" label="Notes" hint="Optional">
              <UTextarea v-model="state.donorNotes" placeholder="Anything we should know?" class="w-full" />
            </UFormField>
            <div class="flex gap-3">
              <UButton
                label="Back"
                variant="ghost"
                color="neutral"
                size="lg"
                @click="back"
              />
              <UButton
                label="Confirm donation"
                type="submit"
                size="lg"
                block
                loading-auto
              />
            </div>
          </div>
        </UForm>
      </div>
    </UTheme>
  </div>
</template>
