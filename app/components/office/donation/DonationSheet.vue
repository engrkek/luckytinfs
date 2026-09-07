<script setup lang="ts">
import type { OfficeDonation } from '~/composables/useOfficeDonations'
import { LazyAppDialog, LazyOfficeDonationForm } from '#components'

const props = defineProps<{ donation: OfficeDonation }>()

const open = defineModel<boolean>('open', { default: false })

const overlay = useOverlay()
const donationForm = overlay.create(LazyOfficeDonationForm)
const deleteConfirm = overlay.create(LazyAppDialog)

const { mutate: updateDonation, isLoading } = useUpdateOfficeDonation()
const { mutate: deleteDonation, isLoading: isDeleting } = useDeleteOfficeDonation()

// The prop is a snapshot from when the sheet was opened — read the live row
// from the shared query cache so edits made elsewhere (or via the edit form)
// show up here without needing to reopen the sheet.
const { donations } = useOfficeDonations()
const donation = computed(() => donations.value.find(d => d.id === props.donation.id) ?? props.donation)

const { copy: copyEmail, copied: emailCopied } = useClipboard()
const { copy: copyUsername, copied: usernameCopied } = useClipboard()

const STATUS_COLOR = {
  pending: 'warning',
  approved: 'success',
  invalid: 'error',
} as const

const DISPLAY_LABEL: Record<string, string> = {
  both: 'Name & handle',
  handle_only: 'Handle only',
  name_only: 'Name only',
  anon: 'Anonymous',
}

const dateFormatter = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' })

function formatDate(value: string | number | Date) {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : dateFormatter.format(d)
}

function money(cents: number) {
  return `₱${(cents / 100).toLocaleString()}`
}

async function handleDelete() {
  const confirmed = await deleteConfirm.open({
    title: 'Delete donation',
    description: `This will permanently delete ${donation.value.donor.name}'s ${money(donation.value.amount)} donation. This cannot be undone.`,
    confirmLabel: 'Delete',
    color: 'error',
  })
  if (!confirmed)
    return
  deleteDonation({ id: donation.value.id })
  open.value = false
}
</script>

<template>
  <AppSheet v-model:open="open" title="Donation details">
    <div class="space-y-6">
      <UCard variant="soft">
        <div class="flex items-start">
          <div class="space-y-1">
            <p class="text-sm text-muted">
              Donation amount
            </p>
            <p class="font-display text-3xl font-bold text-highlighted">
              {{ money(donation.amount) }}
            </p>
            <p class="mt-1 text-sm text-muted">
              {{ donation.campaignTitle ?? 'Wherever it\'s needed most' }}
            </p>
          </div>
          <UBadge
            :label="donation.status"
            :color="STATUS_COLOR[donation.status]"
            variant="subtle"
            size="xl"
            class="ml-auto capitalize"
          />
        </div>
      </UCard>

      <div class="space-y-2">
        <p class="text-xs font-bold text-muted uppercase tracking-wide">
          Details
        </p>
        <div class="grid grid-cols-2 gap-2">
          <div class="bg-elevated/50 rounded-lg p-3">
            <p class="text-xs text-muted">
              Date
            </p>
            <p class="font-bold text-highlighted">
              {{ formatDate(donation.createdAt) }}
            </p>
          </div>
          <div class="bg-elevated/50 rounded-lg p-3">
            <p class="text-xs text-muted">
              Credit as
            </p>
            <p class="font-bold text-highlighted">
              {{ DISPLAY_LABEL[donation.display] ?? donation.display }}
            </p>
          </div>
        </div>

        <UCard :ui="{ body: 'p-0 lg:p-0' }">
          <div class="flex flex-col divide-y divide-default">
            <div class="flex items-center gap-3 px-3 py-2.5">
              <UIcon name="ph:envelope" class="size-5 shrink-0 text-muted" />
              <p class="flex-1">
                Email
              </p>
              <p class="truncate font-medium text-highlighted">
                {{ donation.donor.email }}
              </p>
              <UButton
                :icon="emailCopied ? 'ph:check' : 'ph:copy'"
                size="xs"
                color="neutral"
                variant="ghost"
                :aria-label="`Copy email ${donation.donor.email}`"
                @click="copyEmail(donation.donor.email)"
              />
            </div>
            <div class="flex items-center gap-3 px-3 py-2.5">
              <UIcon name="ph:at" class="size-5 shrink-0 text-muted" />
              <p class="flex-1">
                Username
              </p>
              <p class="truncate font-medium text-highlighted">
                @{{ donation.donor.handle.replace(/^@/, '') }}
              </p>
              <UButton
                :icon="usernameCopied ? 'ph:check' : 'ph:copy'"
                size="xs"
                color="neutral"
                variant="ghost"
                :aria-label="`Copy username ${donation.donor.handle.replace(/^@/, '')}`"
                @click="copyUsername(donation.donor.handle.replace(/^@/, ''))"
              />
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
              <UIcon name="ph:credit-card" class="size-5 shrink-0 text-muted" />
              <p class="flex-1">
                Channel
              </p>
              <p class="font-medium text-highlighted">
                {{ donation.channelLabel }}
              </p>
            </div>
            <div class="flex items-center gap-3 px-3 py-2.5">
              <UIcon name="ph:hash" class="size-5 shrink-0 text-muted" />
              <p class="flex-1">
                Reference no.
              </p>
              <p class="font-medium text-highlighted">
                {{ donation.refNo || '—' }}
              </p>
            </div>
          </div>
        </UCard>
      </div>

      <div v-if="donation.proofUrl" class="space-y-2">
        <p class="text-xs font-bold text-muted uppercase tracking-wide">
          Proof of payment
        </p>
        <UCard :ui="{ body: 'space-y-3' }">
          <NuxtImg :src="donation.proofUrl" alt="Proof of payment screenshot" class="w-full max-h-72 rounded-md border border-default object-cover" />
          <UButton
            :to="donation.proofUrl"
            target="_blank"
            label="Download"
            icon="ph:download-simple"
            variant="outline"
            color="neutral"
            block
            class="rounded-full"
          />
        </UCard>
      </div>

      <div v-if="donation.donorNotes" class="space-y-1">
        <p class="text-xs font-bold text-muted uppercase tracking-wide">
          Donor notes
        </p>
        <UCard class="text-sm text-toned">
          {{ donation.donorNotes }}
        </UCard>
      </div>

      <div class="space-y-2">
        <p class="text-xs font-bold text-muted uppercase tracking-wide">
          Admin review
        </p>
        <UCard :ui="{ body: 'p-0 lg:p-0' }">
          <div class="flex flex-col divide-y divide-default">
            <div class="flex items-center gap-3 px-3 py-2.5">
              <UIcon name="ph:credit-card" class="size-5 shrink-0 text-muted" />
              <p class="flex-1">
                Reviewed by
              </p>
              <p class="font-medium text-highlighted">
                {{ donation.reviewer?.name || '-' }}
              </p>
            </div>
            <div class="flex items-center gap-3 px-3 py-2.5">
              <UIcon name="ph:hash" class="size-5 shrink-0 text-muted" />
              <p class="flex-1">
                Reviewed at
              </p>
              <p class="font-medium text-highlighted">
                {{ donation.updatedAt || '—' }}
              </p>
            </div>
          </div>
        </UCard>

        <div v-if="donation.adminNotes" class="space-y-1">
          <p class="text-xs font-bold text-muted uppercase tracking-wide">
            Admin notes
          </p>
          <UCard class="text-sm text-toned">
            {{ donation.adminNotes }}
          </UCard>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="w-full flex flex-col lg:flex-row lg:items-center lg:justify-end gap-2">
        <UButton
          v-if="donation.status !== 'approved'"
          icon="tabler:circle-check"
          label="Approve"
          color="success"
          :loading="isLoading"
          size="xl"
          class="w-full justify-center"
          @click="updateDonation({ id: donation.id, status: 'approved' })"
        />
        <UButton
          v-if="donation.status !== 'invalid'"
          icon="tabler:cancel"
          label="Invalid"
          color="error"
          size="xl"
          :loading="isLoading"
          class="w-full justify-center"
          @click="updateDonation({ id: donation.id, status: 'invalid' })"
        />
        <UButton
          label="Edit"
          icon="ph:pencil"
          color="neutral"
          variant="soft"
          size="xl"
          class="w-full justify-center"
          @click="donationForm.open({ donation })"
        />
        <UButton
          label="Delete"
          icon="ph:trash"
          color="error"
          variant="soft"
          size="xl"
          class="w-full justify-center"
          :loading="isDeleting"
          @click="handleDelete"
        />
      </div>
    </template>
  </AppSheet>
</template>
