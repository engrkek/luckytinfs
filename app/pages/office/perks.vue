<script setup lang="ts">
import type { TableColumn, TableRow } from '@nuxt/ui'
import type { PerkStatus } from '#shared/perks'
import { LazyAppDialog } from '#components'
import { php } from '#shared/blockscreening'
import { walletType } from '#shared/donations'
import { PERK_STATUS_LABELS, PERK_STATUSES, perkUpdateEmail } from '#shared/perks'

useHead({ title: 'Perks' })

const { data, refresh } = await useFetch('/api/office/perks', { key: 'office-perks' })
const claims = computed(() => data.value?.claims ?? [])
const unclaimed = computed(() => data.value?.unclaimed ?? [])
type Claim = typeof claims.value[number]
type Unclaimed = typeof unclaimed.value[number]

const confirm = useOverlay().create(LazyAppDialog)

const STATUS_COLOR = {
  submitted: 'warning',
  awaiting_payment: 'neutral',
  for_review: 'warning',
  paid: 'info',
  shipped: 'success',
} as const

const statusItems = PERK_STATUSES.map(value => ({ value, label: PERK_STATUS_LABELS[value] }))

const columns: TableColumn<Claim>[] = [
  { accessorKey: 'donorName', header: 'Donor' },
  { accessorKey: 'campaignTitle', header: 'Project' },
  { accessorKey: 'courier', header: 'Courier' },
  { accessorKey: 'shippingFee', header: 'Shipping fee' },
  { accessorKey: 'status', header: 'Status' },
]

// ponytail: the sheet lives in this page; split it out if another page needs it
const open = ref(false)
const selectedId = ref<string>()
const selected = computed(() => claims.value.find(c => c.id === selectedId.value))
const edit = reactive({ shippingFee: undefined as number | undefined, trackingNo: '', status: 'submitted' as PerkStatus, rejectReason: '' })

function syncEdit() {
  const c = selected.value
  if (c)
    Object.assign(edit, { shippingFee: c.shippingFee != null ? c.shippingFee / 100 : undefined, trackingNo: c.trackingNo ?? '', status: c.status, rejectReason: '' })
}

function onSelect(_e: Event, row: TableRow<Claim>) {
  selectedId.value = row.original.id
  syncEdit()
  open.value = true
}

const toast = useToast()

/** The action can return a string to replace the success title */
async function run(title: string, action: () => Promise<unknown>) {
  try {
    const result = await action()
    toast.add({ icon: 'ph:check-circle', title: typeof result === 'string' ? result : title, color: 'success' })
  }
  catch (err) {
    const e = err as { data?: { statusMessage?: string }, message?: string }
    toast.add({ icon: 'ph:x-circle', title: 'That didn\'t work', description: e.data?.statusMessage ?? e.message ?? 'Something went wrong', color: 'error' })
  }
  await refresh()
  syncEdit()
}

function patch(resend = false) {
  // typed by hand: the dynamic path also matches /invite, so the route type can't be inferred
  return $fetch<{ emailed: boolean, emailError: string | null }>(`/api/office/perks/${selectedId.value}`, {
    method: 'PATCH',
    body: {
      shippingFee: edit.shippingFee != null ? Math.round(edit.shippingFee * 100) : undefined,
      trackingNo: edit.trackingNo,
      status: edit.status,
      rejectReason: edit.rejectReason,
      resend,
    },
  })
}

/** Asks first when this save would email the donor (same rule the server sends by) */
async function confirmEmail() {
  const c = selected.value
  const kind = c && perkUpdateEmail(c.status, edit.status)
  if (!kind)
    return true
  const dialogs = {
    paid: {
      title: 'Confirm this payment?',
      description: `${c.donorEmail} will be emailed that their shipping fee is confirmed.`,
      confirmLabel: 'Confirm and email',
    },
    shipped: {
      title: 'Mark as shipped?',
      description: edit.trackingNo.trim()
        ? `${c.donorEmail} will be emailed that their perks are on the way, with tracking no. ${edit.trackingNo.trim()}.`
        : `${c.donorEmail} will be emailed that their perks are on the way, with no tracking number. Cancel and add one first if you have it.`,
      confirmLabel: 'Ship and email',
    },
    rejected: {
      title: 'Reject this payment?',
      description: `${c.donorEmail} will be emailed to submit their payment again${edit.rejectReason.trim() ? `, with your note: "${edit.rejectReason.trim()}"` : ', with no note from you'}.`,
      confirmLabel: 'Reject and email',
      color: 'error' as const,
    },
  }
  return await confirm.open(dialogs[kind])
}

async function save(resend = false) {
  if (!await confirmEmail()) {
    syncEdit()
    return
  }
  await run('Saved', async () => {
    const { emailed, emailError } = await patch(resend)
    if (emailError)
      throw new Error(`Saved, but the email to the donor failed: ${emailError}`)
    return emailed ? 'Saved and donor emailed' : undefined
  })
}

function reject() {
  edit.status = 'awaiting_payment'
  return save()
}

// Donors who earned a tier but haven't filled in the perks form
const unclaimedColumns: TableColumn<Unclaimed>[] = [
  { accessorKey: 'donorName', header: 'Donor' },
  { accessorKey: 'campaignTitle', header: 'Project' },
  { accessorKey: 'tiers', header: 'Earned' },
  { accessorKey: 'invitedAt', header: 'Link emailed' },
  { id: 'actions', header: '' },
]
const notInvited = computed(() => unclaimed.value.filter(u => !u.invitedAt))
const dateFormatter = new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeZone: 'Asia/Manila' })

async function invite(rows: Unclaimed[]) {
  if (rows.length > 1) {
    const ok = await confirm.open({
      title: `Email ${rows.length} donors?`,
      description: 'Each gets their perks form link. Donors who were already emailed are not included.',
      confirmLabel: 'Send emails',
    })
    if (!ok)
      return
  }
  await run('Perks link emailed', async () => {
    const results = await $fetch('/api/office/perks/invite', {
      method: 'POST',
      body: { items: rows.map(({ donorId, campaignId }) => ({ donorId, campaignId })) },
    })
    const failed = results.filter(r => r.result === 'failed')
    if (failed.length)
      throw new Error(`${results.length - failed.length} sent, ${failed.length} failed: ${failed.map(f => `${f.email} (${f.reason})`).join(', ')}`)
    return `Perks link emailed to ${results.length} donor${results.length === 1 ? '' : 's'}`
  })
}

const { copy: copyLink, copied: linkCopied } = useClipboard()

function perksLink(c: { donorId: string, campaignId: string }) {
  return `${location.origin}/perks?${new URLSearchParams({ donor: c.donorId, campaign: c.campaignId })}`
}

// Saves first, so the email always carries the fee that's on screen
function sendPaymentEmail() {
  return run('Shipping fee email sent', async () => {
    await patch()
    await $fetch(`/api/office/perks/${selectedId.value}/email`, { method: 'POST' })
  })
}

const canEmail = computed(() => selected.value?.status === 'submitted' || selected.value?.status === 'awaiting_payment')
</script>

<template>
  <UDashboardPanel id="perks">
    <template #body>
      <div>
        <h1 class="font-display text-3xl tracking-tighter">
          Perks
        </h1>
        <p class="text-muted">
          Shipping details from donors claiming their perks. Set the shipping fee, email it, verify the payment, ship.
        </p>
      </div>

      <UCard :ui="{ body: 'p-0 lg:p-0' }">
        <UTable :data="claims" :columns empty="No perk claims yet." @select="onSelect">
          <template #donorName-cell="{ row }">
            <p class="text-highlighted font-bold">
              {{ row.original.donorName }}
            </p>
            <p>{{ row.original.donorEmail }}</p>
          </template>
          <template #shippingFee-cell="{ row }">
            <span class="font-mono">{{ row.original.shippingFee != null ? php(row.original.shippingFee) : '—' }}</span>
          </template>
          <template #status-cell="{ row }">
            <UBadge
              :label="PERK_STATUS_LABELS[row.original.status as PerkStatus] ?? row.original.status"
              :color="STATUS_COLOR[row.original.status as PerkStatus]"
              variant="soft"
            />
          </template>
        </UTable>
      </UCard>

      <UCard :ui="{ body: 'p-0 lg:p-0' }">
        <div class="flex flex-wrap items-center gap-2 p-3">
          <div>
            <p class="font-bold text-highlighted">
              Not claimed yet
            </p>
            <p class="text-sm text-muted">
              Donors who earned a tier but haven't sent their shipping details.
            </p>
          </div>
          <UButton
            :label="`Email link to ${notInvited.length} not yet emailed`"
            icon="ph:paper-plane-tilt"
            color="secondary"
            class="ml-auto"
            loading-auto
            :disabled="!notInvited.length"
            @click="invite(notInvited)"
          />
        </div>
        <div class="border-t border-default">
          <UTable :data="unclaimed" :columns="unclaimedColumns" empty="Everyone who earned a tier has claimed.">
            <template #donorName-cell="{ row }">
              <p class="text-highlighted font-bold">
                {{ row.original.donorName }}
              </p>
              <p>{{ row.original.donorEmail }}</p>
            </template>
            <template #tiers-cell="{ row }">
              {{ row.original.tiers.map(t => t.name).join(', ') }} · {{ php(row.original.total) }}
            </template>
            <template #invitedAt-cell="{ row }">
              <span :class="{ 'text-muted': !row.original.invitedAt }">{{ row.original.invitedAt ? dateFormatter.format(row.original.invitedAt) : 'Not yet' }}</span>
            </template>
            <template #actions-cell="{ row }">
              <div class="flex justify-end gap-1">
                <UButton
                  icon="ph:link"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  aria-label="Copy perks link"
                  @click="copyLink(perksLink(row.original))"
                />
                <UButton
                  :label="row.original.invitedAt ? 'Resend' : 'Email link'"
                  color="neutral"
                  variant="soft"
                  size="sm"
                  loading-auto
                  @click="invite([row.original])"
                />
              </div>
            </template>
          </UTable>
        </div>
      </UCard>

      <AppSheet v-model:open="open" title="Perk claim" :description="selected?.campaignTitle">
        <div v-if="selected" class="space-y-6">
          <UCard variant="soft">
            <p class="font-bold text-highlighted">
              {{ selected.recipientName }} · {{ selected.phone }}
            </p>
            <p class="whitespace-pre-line">
              {{ selected.address }}
            </p>
            <p class="mt-2 text-sm text-muted">
              {{ selected.courier }}<template v-if="selected.size">
                · Size {{ selected.size }}
              </template>
            </p>
            <p v-if="selected.notes" class="mt-2 text-sm">
              “{{ selected.notes }}”
            </p>
            <p class="mt-2 text-sm text-muted">
              Donor: {{ selected.donorName }} (@{{ selected.donorHandle.replace(/^@/, '') }}) · {{ selected.donorEmail }}
            </p>
            <UButton
              :label="linkCopied ? 'Copied' : 'Copy perks link'"
              :icon="linkCopied ? 'ph:check' : 'ph:link'"
              color="neutral"
              variant="outline"
              size="sm"
              class="mt-3"
              @click="copyLink(perksLink(selected))"
            />
          </UCard>

          <UCard v-if="selected.refNo" variant="soft">
            <p class="text-sm text-muted">
              Paid via {{ selected.channelType ? walletType(selected.channelType).label : '—' }}
            </p>
            <p class="font-mono font-bold text-highlighted">
              {{ selected.refNo }}
            </p>
            <UButton
              v-if="selected.proofUrl"
              :to="selected.proofUrl"
              target="_blank"
              label="View payment screenshot"
              icon="ph:image"
              variant="link"
              class="px-0"
            />
          </UCard>

          <UFormField label="Shipping fee">
            <UInputNumber
              v-model="edit.shippingFee"
              :min="0"
              :step-snapping="false"
              :format-options="{ style: 'currency', currency: 'PHP' }"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Status" description="Changing this to Paid or Shipped emails the donor. You'll be asked to confirm first.">
            <USelect v-model="edit.status" :items="statusItems" value-key="value" class="w-full" />
          </UFormField>
          <UFormField v-if="selected.status === 'for_review'" label="Note if rejecting" hint="Optional" description="Included in the email asking the donor to pay again.">
            <UInput v-model="edit.rejectReason" placeholder="e.g. The reference number doesn't match our records" class="w-full" />
          </UFormField>
          <UFormField label="Tracking no." description="Shown to the donor on their perks page.">
            <UInput v-model="edit.trackingNo" class="w-full" />
          </UFormField>
        </div>

        <template #footer>
          <UButton
            v-if="canEmail"
            :label="selected?.paymentEmailSentAt ? 'Resend fee email' : 'Email shipping fee'"
            icon="ph:paper-plane-tilt"
            color="neutral"
            variant="soft"
            size="lg"
            block
            loading-auto
            :disabled="!edit.shippingFee"
            @click="sendPaymentEmail"
          />
          <UButton
            v-else-if="selected?.status === 'for_review'"
            label="Reject payment"
            icon="ph:x-circle"
            color="error"
            variant="soft"
            size="lg"
            block
            loading-auto
            @click="reject"
          />
          <UButton
            v-else
            label="Resend update email"
            icon="ph:paper-plane-tilt"
            color="neutral"
            variant="soft"
            size="lg"
            block
            loading-auto
            @click="save(true)"
          />
          <UButton
            label="Save"
            size="lg"
            block
            loading-auto
            @click="save()"
          />
        </template>
      </AppSheet>
    </template>
  </UDashboardPanel>
</template>
