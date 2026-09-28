<script setup lang="ts">
import type { CEvent, OfficeEventRsvp } from '#shared/types'
import { LazyOfficeEventRsvpForm } from '#components'
import { BLOCKSCREENING_REG_PREFIX, emailBlockReason } from '#shared/blockscreening'
import { holdsSeats, rsvpStatus } from '#shared/events'
import { formatSocial, socialIcon } from '#shared/social'

const props = defineProps<{ event: CEvent, rsvp: OfficeEventRsvp }>()

const open = defineModel<boolean>('open', { default: false })

const rsvpForm = useOverlay().create(LazyOfficeEventRsvpForm)
const { setStatus, remove, pending } = useEventRsvpActions(() => props.event.id)

// The prop is a snapshot from when the sheet opened — read the live row from the
// page's fetch so status changes and edits show without reopening.
const { data: rsvps } = useNuxtData<OfficeEventRsvp[]>(`event-${props.event.id}-rsvps`)
const rsvp = computed(() => rsvps.value?.find(r => r.id === props.rsvp.id) ?? props.rsvp)
const status = computed(() => rsvpStatus(rsvp.value.status))

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 2 })
const dateFormat = new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short' })

const social = computed(() => formatSocial(rsvp.value.socialPlatform, rsvp.value.socialHandle))
const isPdfReceipt = computed(() => rsvp.value.receiptUrl?.toLowerCase().endsWith('.pdf'))

// Confirmation works for any event; payment, food and sponsor are block screening only.
// The two final emails also confirm the slot. Sent times come from rsvp.emailsSent.
type EmailKind = 'payment' | 'confirmation' | 'food' | 'sponsor'
const toast = useToast()
const sending = ref<EmailKind | null>(null)

const isBlockscreening = computed(() => props.event.regPrefix === BLOCKSCREENING_REG_PREFIX)

const emails = computed(() => {
  const all: { kind: EmailKind, label: string, icon: string }[] = isBlockscreening.value
    ? [
        { kind: 'payment', label: 'Payment instructions', icon: 'ph:credit-card' },
        { kind: 'food', label: 'Food form', icon: 'ph:bowl-food' },
        { kind: 'confirmation', label: 'Attendee pass', icon: 'ph:ticket' },
        { kind: 'sponsor', label: 'Sponsor thank-you', icon: 'ph:hand-heart' },
      ]
    : [{ kind: 'confirmation', label: 'Confirmation pass', icon: 'ph:ticket' }]
  // Same rules the server enforces (emailBlockReason), so what's listed is what can be sent
  return all
    .filter(e => !emailBlockReason(e.kind, rsvp.value))
    .map(e => ({ ...e, sentAt: rsvp.value.emailsSent?.[e.kind] }))
})

async function sendEmail(kind: EmailKind, label: string) {
  sending.value = kind
  try {
    await $fetch(`/api/office/events/${props.event.id}/rsvps/${rsvp.value.id}/email`, { method: 'POST', body: { kind } })
    await refreshNuxtData(`event-${props.event.id}-rsvps`)
    toast.add({ icon: 'ph:paper-plane-tilt', title: `${label} sent`, description: rsvp.value.email ?? undefined, color: 'success' })
  }
  catch (err) {
    const e = err as { data?: { statusMessage?: string }, message?: string }
    toast.add({ icon: 'ph:x-circle', title: 'Email failed', description: e.data?.statusMessage ?? e.message ?? 'Something went wrong', color: 'error' })
  }
  finally {
    sending.value = null
  }
}

async function onDelete() {
  if (await remove(rsvp.value))
    open.value = false
}
</script>

<template>
  <AppSheet v-model:open="open" title="Registration details">
    <div class="space-y-6">
      <UCard variant="soft">
        <div class="flex items-start gap-3">
          <div class="min-w-0 space-y-1">
            <p class="text-sm text-muted">
              Reg ID
            </p>
            <p class="font-display text-3xl font-bold tracking-tight tabular-nums text-highlighted">
              {{ rsvp.regId }}
            </p>
            <p class="text-sm text-toned truncate">
              {{ rsvp.fullName }}<span v-if="rsvp.nickname" class="text-muted"> · {{ rsvp.nickname }}</span>
            </p>
          </div>
          <UBadge
            :label="status.label"
            :color="status.color"
            variant="subtle"
            size="xl"
            class="ml-auto shrink-0"
          />
        </div>
      </UCard>

      <div class="space-y-2">
        <p class="text-xs font-bold text-muted uppercase tracking-wide">
          Contact
        </p>
        <UCard :ui="{ body: 'p-0 lg:p-0' }">
          <div class="flex flex-col divide-y divide-default">
            <div class="flex items-center gap-3 px-3 py-2.5">
              <UIcon name="ph:envelope" class="size-5 shrink-0 text-muted" />
              <p class="flex-1">
                Email
              </p>
              <p class="truncate font-medium text-highlighted">
                {{ rsvp.email || '—' }}
              </p>
              <AppCopyButton v-if="rsvp.email" :value="rsvp.email" label="email" />
            </div>
            <div class="flex items-center gap-3 px-3 py-2.5">
              <UIcon name="ph:phone" class="size-5 shrink-0 text-muted" />
              <p class="flex-1">
                Mobile
              </p>
              <p class="truncate font-medium tabular-nums text-highlighted">
                {{ rsvp.contactNumber || '—' }}
              </p>
              <AppCopyButton v-if="rsvp.contactNumber" :value="rsvp.contactNumber" label="mobile number" />
            </div>
            <div class="flex items-center gap-3 px-3 py-2.5">
              <UIcon :name="socialIcon(rsvp.socialPlatform)" class="size-5 shrink-0 text-muted" />
              <p class="flex-1">
                {{ rsvp.socialPlatform || 'Social' }}
              </p>
              <AppSocialHandle v-if="social" :social class="font-medium" />
              <p v-else class="font-medium text-muted">
                —
              </p>
              <AppCopyButton v-if="rsvp.socialHandle" :value="rsvp.socialHandle" label="social handle" />
            </div>
          </div>
        </UCard>
      </div>

      <div v-if="rsvp.companions?.length || rsvp.sponsoredKids" class="space-y-2">
        <p class="text-xs font-bold text-muted uppercase tracking-wide">
          Kids
        </p>
        <UCard :ui="{ body: 'p-0 lg:p-0' }">
          <div class="flex flex-col divide-y divide-default">
            <div v-if="!rsvp.attending" class="flex items-center gap-3 px-3 py-2.5">
              <UIcon name="ph:user-minus" class="size-5 shrink-0 text-muted" />
              <p class="flex-1">
                Registrant
              </p>
              <p class="font-medium text-highlighted">
                Sponsor only, not attending
              </p>
            </div>
            <div v-if="rsvp.sponsoredKids" class="flex items-center gap-3 px-3 py-2.5">
              <UIcon name="ph:hand-heart" class="size-5 shrink-0 text-muted" />
              <p class="flex-1">
                Sponsored charity kids
              </p>
              <p class="font-medium tabular-nums text-highlighted">
                {{ rsvp.sponsoredKids }}
              </p>
            </div>
            <div v-for="c in rsvp.companions" :key="c.name" class="flex items-center gap-3 px-3 py-2.5">
              <UIcon name="ph:baby" class="size-5 shrink-0 text-muted" />
              <p class="flex-1 truncate font-medium text-highlighted">
                {{ c.name }}
              </p>
              <p v-if="c.relationship" class="text-muted capitalize">
                {{ c.relationship }}
              </p>
            </div>
          </div>
        </UCard>
      </div>

      <div v-if="rsvp.food?.length" class="space-y-2">
        <p class="text-xs font-bold text-muted uppercase tracking-wide">
          Food
        </p>
        <UCard :ui="{ body: 'p-0 lg:p-0' }">
          <div class="flex flex-col divide-y divide-default">
            <div v-for="f in rsvp.food" :key="f.name" class="flex items-center gap-3 px-3 py-2.5">
              <UIcon name="ph:bowl-food" class="size-5 shrink-0 text-muted" />
              <p class="flex-1 truncate">
                {{ f.name }}
              </p>
              <p class="font-medium text-highlighted">
                {{ f.choice }}
              </p>
            </div>
          </div>
        </UCard>
      </div>

      <div class="space-y-2">
        <p class="text-xs font-bold text-muted uppercase tracking-wide">
          Payment
        </p>
        <UCard :ui="{ body: 'p-0 lg:p-0' }">
          <div class="flex flex-col divide-y divide-default">
            <div class="flex items-center gap-3 px-3 py-2.5">
              <UIcon name="ph:money" class="size-5 shrink-0 text-muted" />
              <p class="flex-1">
                Fee paid
              </p>
              <p class="font-medium tabular-nums text-highlighted">
                {{ rsvp.regFee != null ? peso.format(rsvp.regFee / 100) : 'Not recorded' }}
              </p>
            </div>
            <div class="flex items-center gap-3 px-3 py-2.5">
              <UIcon name="ph:wallet" class="size-5 shrink-0 text-muted" />
              <p class="flex-1">
                Paid to
              </p>
              <p class="truncate font-medium" :class="rsvp.channelLabel ? 'text-highlighted' : 'text-muted'">
                {{ rsvp.channelLabel ?? 'Not linked' }}
              </p>
            </div>
            <div class="flex items-center gap-3 px-3 py-2.5">
              <UIcon name="ph:hash" class="size-5 shrink-0 text-muted" />
              <p class="flex-1">
                Reference no.
              </p>
              <p class="truncate font-medium tabular-nums text-highlighted">
                {{ rsvp.refNo || '—' }}
              </p>
              <AppCopyButton v-if="rsvp.refNo" :value="rsvp.refNo" label="reference number" />
            </div>
          </div>
        </UCard>

        <UCard v-if="rsvp.receiptUrl" :ui="{ body: 'space-y-3' }">
          <ProseImg
            v-if="!isPdfReceipt"
            :src="rsvp.receiptUrl"
            alt="Payment receipt"
            class="w-full max-h-72 rounded-md object-cover outline outline-black/10 -outline-offset-1 dark:outline-white/10"
          />
          <UButton
            :to="rsvp.receiptUrl"
            target="_blank"
            :label="isPdfReceipt ? 'Open receipt (PDF)' : 'Download receipt'"
            :icon="isPdfReceipt ? 'ph:file-pdf' : 'ph:download-simple'"
            variant="outline"
            color="neutral"
            block
            class="rounded-full"
          />
        </UCard>
      </div>

      <div class="space-y-2">
        <p class="text-xs font-bold text-muted uppercase tracking-wide">
          Emails
        </p>
        <UCard v-if="emails.length" :ui="{ body: 'p-0 lg:p-0' }">
          <div class="flex flex-col divide-y divide-default">
            <div v-for="e in emails" :key="e.kind" class="flex items-center gap-3 px-3 py-2.5">
              <UIcon :name="e.icon" class="size-5 shrink-0 text-muted" />
              <div class="flex-1 min-w-0">
                <p class="truncate">
                  {{ e.label }}
                </p>
                <p class="flex items-center gap-1 text-xs" :class="e.sentAt ? 'text-success' : 'text-muted'">
                  <UIcon :name="e.sentAt ? 'ph:check-circle-fill' : 'ph:circle-dashed'" class="size-3.5 shrink-0" />
                  <span class="tabular-nums">{{ e.sentAt ? `Sent ${dateFormat.format(new Date(e.sentAt))}` : 'Not sent' }}</span>
                </p>
              </div>
              <UButton
                :label="e.sentAt ? 'Resend' : 'Send'"
                :icon="e.sentAt ? 'ph:arrow-clockwise' : 'ph:paper-plane-tilt'"
                :color="e.sentAt ? 'neutral' : 'primary'"
                :variant="e.sentAt ? 'ghost' : 'soft'"
                size="sm"
                :loading="sending === e.kind"
                :disabled="!!sending || !rsvp.email"
                @click="sendEmail(e.kind, e.label)"
              />
            </div>
          </div>
        </UCard>
        <p v-else class="text-sm text-muted">
          No emails for cancelled or invalid registrations.
        </p>
        <p v-if="!rsvp.email && emails.length" class="text-xs text-muted">
          Add an email address to send these.
        </p>
        <p v-if="isBlockscreening && rsvp.sponsoredKids && rsvp.attending && holdsSeats(rsvp.status)" class="text-xs text-muted">
          The sponsor thank-you shows once "Registrant attends" is turned off in Edit.
        </p>
      </div>

      <div class="space-y-2">
        <p class="text-xs font-bold text-muted uppercase tracking-wide">
          Review
        </p>
        <UCard :ui="{ body: 'p-0 lg:p-0' }">
          <div class="flex flex-col divide-y divide-default">
            <div class="flex items-center gap-3 px-3 py-2.5">
              <UIcon name="ph:user-check" class="size-5 shrink-0 text-muted" />
              <p class="flex-1">
                Reviewed by
              </p>
              <p class="truncate font-medium" :class="rsvp.reviewerName ? 'text-highlighted' : 'text-muted'">
                {{ rsvp.reviewerName ?? 'Not reviewed yet' }}
              </p>
            </div>
            <!-- ponytail: updatedAt doubles as review time; every admin save sets reviewedBy -->
            <div v-if="rsvp.reviewedBy" class="flex items-center gap-3 px-3 py-2.5">
              <UIcon name="ph:clock" class="size-5 shrink-0 text-muted" />
              <p class="flex-1">
                Reviewed at
              </p>
              <p class="font-medium tabular-nums text-highlighted">
                {{ dateFormat.format(new Date(rsvp.updatedAt)) }}
              </p>
            </div>
            <div class="flex items-center gap-3 px-3 py-2.5">
              <UIcon name="ph:calendar-blank" class="size-5 shrink-0 text-muted" />
              <p class="flex-1">
                Registered
              </p>
              <p class="font-medium tabular-nums text-highlighted">
                {{ dateFormat.format(new Date(rsvp.createdAt)) }}
              </p>
            </div>
          </div>
        </UCard>

        <UCard v-if="rsvp.notes" class="text-sm text-toned whitespace-pre-line">
          <p class="text-xs text-muted mb-1">
            Internal notes
          </p>
          {{ rsvp.notes }}
        </UCard>
      </div>
    </div>

    <template #footer>
      <!-- Review decisions first, then secondary actions -->
      <div class="w-full flex flex-col gap-2">
        <div class="flex gap-2">
          <UButton
            v-if="rsvp.status !== 'confirmed'"
            icon="ph:check-circle"
            label="Confirm"
            color="success"
            size="xl"
            class="flex-1 justify-center"
            :loading="pending === 'confirmed'"
            :disabled="!!pending"
            @click="setStatus(rsvp, 'confirmed')"
          />
          <UButton
            v-if="rsvp.status !== 'rejected'"
            icon="ph:x-circle"
            label="Invalid"
            color="error"
            size="xl"
            class="flex-1 justify-center"
            :loading="pending === 'rejected'"
            :disabled="!!pending"
            @click="setStatus(rsvp, 'rejected')"
          />
        </div>
        <div class="flex gap-2">
          <UButton
            label="Edit"
            icon="ph:pencil"
            color="neutral"
            variant="soft"
            size="lg"
            class="flex-1 justify-center"
            @click="rsvpForm.open({ type: 'edit', event, rsvp })"
          />
          <UButton
            label="Delete"
            icon="ph:trash"
            color="error"
            variant="soft"
            size="lg"
            class="flex-1 justify-center"
            :loading="pending === 'delete'"
            :disabled="!!pending"
            @click="onDelete"
          />
        </div>
      </div>
    </template>
  </AppSheet>
</template>
