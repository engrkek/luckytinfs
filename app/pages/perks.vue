<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Channel } from '#shared/types'
import { z } from 'zod'
import { php } from '#shared/blockscreening'
import { walletType } from '#shared/donations'
import { COURIERS } from '#shared/perks'

useSeoMeta({ title: 'Claim your perks', robots: 'noindex' })

// The receipt and shipping fee emails link here with ?donor=&campaign=.
// One link for the whole claim: it shows whichever step the claim is at.
const route = useRoute()
const key = { donor: String(route.query.donor ?? ''), campaign: String(route.query.campaign ?? '') }

const { data, error, refresh } = await useFetch('/api/perks', { query: key })
const { data: channels } = await useFetch<Channel[]>('/api/channels')

const claim = computed(() => data.value?.claim)
const couriers: string[] = [...COURIERS]
const editing = ref(false)
const toast = useToast()

function fail(err: unknown) {
  const e = err as { data?: { statusMessage?: string }, message?: string }
  toast.add({
    icon: 'ph:x-circle',
    title: 'Couldn\'t send that',
    description: e.data?.statusMessage ?? e.message ?? 'Something went wrong. Try again.',
    color: 'error',
  })
}

// Step 1: shipping details
// preprocess to '' so a missing value is a normal issue, not a fatal one that skips .refine (see DonateForm)
const required = (message: string) => z.preprocess(v => v ?? '', z.string().trim().min(1, message))

const schema = z.object({
  recipientName: required('Enter the name of whoever will receive the parcel'),
  phone: z.preprocess(v => v ?? '', z.string().trim().regex(/^[\d+\s()-]{7,20}$/, 'Enter a valid mobile number')),
  address: z.preprocess(v => v ?? '', z.string().trim().min(10, 'Enter your complete address')),
  courier: required('Choose a courier'),
  size: z.string().optional(),
  notes: z.string().optional(),
}).refine(d => !data.value?.sizes.length || !!d.size, { message: 'Choose a size', path: ['size'] })
type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  recipientName: claim.value?.recipientName,
  phone: claim.value?.phone,
  address: claim.value?.address,
  courier: claim.value?.courier,
  size: claim.value?.size ?? undefined,
  notes: claim.value?.notes ?? undefined,
})

async function submitDetails(event: FormSubmitEvent<Schema>) {
  try {
    await $fetch('/api/perks', { method: 'POST', body: { ...key, ...event.data } })
    await refresh()
    editing.value = false
  }
  catch (err) {
    fail(err)
  }
}

// Step 2: shipping fee payment
const pay = reactive({ channelId: undefined as string | undefined, refNo: '' })
const proof = ref<File | null>(null)
const payError = ref('')

const channelItems = computed(() => (channels.value ?? []).map(c => ({ value: c.id, label: walletType(c.type).label })))
const selectedChannel = computed(() => channels.value?.find(c => c.id === pay.channelId))

async function submitPayment() {
  if (!pay.channelId || !pay.refNo.trim() || !proof.value) {
    payError.value = 'Choose the wallet you paid to, enter the reference number and attach your screenshot.'
    return
  }
  payError.value = ''

  try {
    const body = new FormData()
    body.append('proof', proof.value)
    const { pathname } = await $fetch<{ pathname: string }>('/api/donations/proof', { method: 'POST', body })

    await $fetch('/api/perks/payment', {
      method: 'POST',
      body: { ...key, channelId: pay.channelId, refNo: pay.refNo, proofUrl: `/images/${pathname}` },
    })
    await refresh()
  }
  catch (err) {
    fail(err)
  }
}

const STATUS_COPY: Record<string, { icon: string, title: string, text: string }> = {
  submitted: { icon: 'ph:package', title: 'We have your details', text: 'We\'ll email you the shipping fee once we\'ve checked it with your courier.' },
  for_review: { icon: 'ph:hourglass-medium', title: 'Payment submitted', text: 'We\'re verifying your shipping fee payment. Your perks ship once it\'s confirmed.' },
  paid: { icon: 'ph:check-circle', title: 'Shipping fee confirmed', text: 'Your perks are being packed and will be on their way soon.' },
  shipped: { icon: 'ph:truck', title: 'Your perks are on the way', text: 'Thank you for supporting Maloi & Jhoanna!' },
}
const statusCopy = computed(() => claim.value && STATUS_COPY[claim.value.status])
</script>

<template>
  <div class="bg-secondary-600 text-white">
    <UContainer class="max-w-xl py-20 space-y-12">
      <div class="space-y-3 text-center">
        <h1 class="font-display font-medium text-4xl lg:text-5xl tracking-tight text-balance">
          Claim your <span class="italic text-primary-400">perks</span>
        </h1>
        <p v-if="data" class="text-lg text-white/80 text-balance">
          Thank you for supporting {{ data.project }}, {{ data.name }}!
        </p>
      </div>

      <UTheme
        :ui="{ button: { base: 'text-base px-5 py-4 rounded-full' } }"
        :props="{ button: { size: 'xl' }, formField: { size: 'xl' } }"
      >
        <div class="rip bg-paper drop-shadow-xl px-6 py-10 sm:px-10 sm:py-12 text-secondary-950">
          <div v-if="error || !data" class="space-y-4 py-6 text-center">
            <UIcon name="ph:link-break" class="size-14 text-secondary-600" />
            <p class="text-secondary-900/70 mx-auto max-w-sm text-pretty">
              {{ error?.statusMessage ?? 'This perks link isn\'t valid.' }} Use the link from your donation receipt email, or message Luckytin Fan Support.
            </p>
          </div>

          <div v-else class="space-y-8">
            <div v-if="data.tiers.length" class="space-y-3">
              <div v-for="tier in data.tiers" :key="tier.name">
                <p class="font-bold">
                  🎁 {{ tier.name }}
                </p>
                <ul class="list-disc pl-6 text-secondary-900/80">
                  <li v-for="item in tier.items" :key="item">
                    {{ item }}
                  </li>
                </ul>
              </div>
            </div>

            <UForm
              v-if="!claim || editing"
              :schema
              :state
              class="space-y-6"
              @submit="submitDetails"
            >
              <UFormField name="recipientName" label="Recipient name" required>
                <UInput v-model="state.recipientName" placeholder="Full name on the parcel" autocomplete="name" class="w-full" />
              </UFormField>
              <UFormField name="phone" label="Mobile number" required description="The courier will call or text this number.">
                <UInput
                  v-model="state.phone"
                  type="tel"
                  placeholder="09XX XXX XXXX"
                  autocomplete="tel"
                  class="w-full"
                />
              </UFormField>
              <UFormField name="address" label="Shipping address" required description="House/unit no., street, barangay, city, province and ZIP code.">
                <UTextarea v-model="state.address" :rows="3" autocomplete="street-address" class="w-full" />
              </UFormField>
              <UFormField name="courier" label="Courier" required description="Shipping is paid by you. We'll email the fee once we've checked it.">
                <URadioGroup v-model="state.courier" :items="couriers" variant="card" :ui="{ fieldset: 'grid sm:grid-cols-2' }" />
              </UFormField>
              <UFormField v-if="data.sizes.length" name="size" label="Size" required>
                <URadioGroup
                  v-model="state.size"
                  :items="data.sizes"
                  variant="card"
                  indicator="hidden"
                  orientation="horizontal"
                />
              </UFormField>
              <UFormField name="notes" label="Notes" hint="Optional">
                <UTextarea v-model="state.notes" placeholder="Landmarks, preferred delivery time, etc." class="w-full" />
              </UFormField>
              <UButton
                label="Submit shipping details"
                type="submit"
                size="lg"
                block
                loading-auto
              />
            </UForm>

            <template v-else>
              <div class="border-secondary-900/15 rounded-md border p-4 text-sm">
                <p class="font-semibold text-muted uppercase">
                  Ship to
                </p>
                <p class="font-bold">
                  {{ claim.recipientName }} · {{ claim.phone }}
                </p>
                <p class="whitespace-pre-line">
                  {{ claim.address }}
                </p>
                <p class="mt-2 text-secondary-900/70">
                  {{ claim.courier }}<template v-if="claim.size">
                    · Size {{ claim.size }}
                  </template>
                </p>
              </div>

              <div v-if="claim.status === 'awaiting_payment'" class="space-y-6">
                <p>
                  Shipping fee: <strong class="text-2xl font-display">
                    {{ php(claim.shippingFee ?? 0) }}
                  </strong>
                </p>
                <UFormField label="Pay to" required>
                  <URadioGroup
                    v-model="pay.channelId"
                    :items="channelItems"
                    variant="card"
                    indicator="hidden"
                    value-key="value"
                    :ui="{ fieldset: 'grid sm:grid-cols-2' }"
                  />
                </UFormField>
                <WalletDetails v-if="selectedChannel" :channel="selectedChannel" />
                <UFormField label="Reference number" required>
                  <UInput v-model="pay.refNo" placeholder="From your payment confirmation" class="w-full" />
                </UFormField>
                <UFormField label="Payment screenshot" required :error="payError || undefined">
                  <UFileUpload
                    v-model="proof"
                    accept="image/*,.pdf"
                    label="Drop your screenshot here"
                    class="aspect-square"
                  />
                </UFormField>
                <UButton
                  label="Submit payment"
                  size="lg"
                  block
                  loading-auto
                  @click="submitPayment"
                />
              </div>

              <div v-else-if="statusCopy" class="space-y-3 text-center">
                <UIcon :name="statusCopy.icon" class="size-14 text-secondary-600" />
                <h2 class="font-display text-2xl">
                  {{ statusCopy.title }}
                </h2>
                <p class="text-secondary-900/70 mx-auto max-w-sm text-pretty">
                  {{ statusCopy.text }}
                </p>
                <p v-if="claim.trackingNo">
                  Tracking no. <strong class="font-mono">
                    {{ claim.trackingNo }}
                  </strong>
                </p>
                <UButton
                  v-if="claim.status === 'submitted'"
                  label="Edit details"
                  variant="soft"
                  color="secondary"
                  @click="editing = true"
                />
              </div>
            </template>
          </div>
        </div>
      </UTheme>
    </UContainer>
  </div>
</template>
