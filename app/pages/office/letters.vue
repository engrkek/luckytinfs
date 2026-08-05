<script setup lang="ts">
import type { LetterStatus } from '#shared/letters/types'
import { todaysTourStop, TOUR_STOPS } from '#shared/letters/tour'
import { RECIPIENT_THEME } from '#shared/letters/visuals'

useHead({ title: 'Letters' })

const FILTERS: { label: string, value: LetterStatus | 'all' }[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'All', value: 'all' },
]

const statusFilter = ref<LetterStatus | 'all'>('pending')

/** Show day: default to that stop's letters; otherwise all stops */
const stopFilter = ref<string>(todaysTourStop()?.id ?? 'all')
const stopCity = (id: string) => TOUR_STOPS.find(s => s.id === id)?.city ?? id

const { letters, isPending, error, refetch } = useOfficeLetters()
const {
  mutate: updateLetter,
  isLoading: isSaving,
  variables: savingVars,
} = useUpdateOfficeLetter()

const savingId = computed(() =>
  isSaving.value ? savingVars.value?.id ?? null : null,
)

const counts = computed(() => {
  const c: Record<string, number> = { pending: 0, approved: 0, rejected: 0, all: letters.value.length }
  for (const l of letters.value) c[l.status] = (c[l.status] ?? 0) + 1
  return c
})

const visible = computed(() =>
  letters.value.filter(l =>
    (statusFilter.value === 'all' || l.status === statusFilter.value)
    && (stopFilter.value === 'all' || l.tourStop === stopFilter.value),
  ),
)

const dateFormatter = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

function formatDate(value: string | number | Date) {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : dateFormatter.format(d)
}

function theme(recipient: string) {
  return RECIPIENT_THEME[recipient as keyof typeof RECIPIENT_THEME]
}

const STATUS_BADGE_CLASS: Record<LetterStatus, string> = {
  pending: 'bg-warning-100 text-warning-800 ring-1 ring-inset ring-warning-500/20',
  approved: 'bg-success-100 text-success-800 ring-1 ring-inset ring-success-500/20',
  rejected: 'bg-error-100 text-error-800 ring-1 ring-inset ring-error-500/20',
}

function statusBadgeClass(status: LetterStatus) {
  return STATUS_BADGE_CLASS[status]
}

const notesDraft = reactive<Record<string, string>>({})

function noteValue(id: string, fallback: string | null) {
  return notesDraft[id] ?? fallback ?? ''
}

function saveNotes(id: string, current: string | null) {
  const next = notesDraft[id] ?? current ?? ''
  if (next === (current ?? ''))
    return
  updateLetter({ id, adminNotes: next })
}
</script>

<template>
  <UContainer class="max-w-3xl py-6 space-y-4">
    <div class="space-y-2">
      <h1 class="font-display text-3xl text-primary-100 tracking-tight">
        the letter queue
      </h1>
    </div>

    <div role="group" aria-label="Filter letters by status" class="flex flex-wrap gap-2">
      <UButton
        v-for="f in FILTERS"
        :key="f.value"
        :variant="statusFilter === f.value ? 'solid' : 'outline'"
        type="button"
        :aria-pressed="statusFilter === f.value"
        class="rounded-full px-3.5 py-1.5 font-type font-bold text-xs uppercase"
        :class="statusFilter === f.value ? 'text-secondary-950' : ''"
        @click="statusFilter = f.value"
      >
        {{ f.label }} ({{ counts[f.value] }})
      </UButton>
    </div>

    <div role="group" aria-label="Filter letters by tour stop" class="flex flex-wrap gap-2">
      <UButton
        v-for="s in [{ id: 'all', city: 'All stops' }, ...TOUR_STOPS]"
        :key="s.id"
        :variant="stopFilter === s.id ? 'solid' : 'outline'"
        type="button"
        :aria-pressed="stopFilter === s.id"
        class="rounded-full px-3.5 py-1.5 font-type font-bold text-xs uppercase"
        :class="stopFilter === s.id ? 'text-secondary-950' : ''"
        @click="stopFilter = s.id"
      >
        {{ s.city }}
      </UButton>
    </div>

    <p aria-live="polite" class="sr-only">
      <template v-if="isPending">
        Loading letters
      </template>
      <template v-else-if="error">
        Couldn't load the letter queue
      </template>
      <template v-else>
        {{ visible.length }} letter{{ visible.length === 1 ? '' : 's' }} shown
      </template>
    </p>

    <div class="space-y-4">
      <p v-if="isPending" class="text-center text-sm text-primary-200/70">
        Loading…
      </p>
      <div v-else-if="error" class="flex flex-col items-center gap-2 py-2 text-center text-sm text-primary-200/70">
        <p>Couldn't load the letter queue. Check your connection and try again.</p>
        <UButton size="sm" variant="outline" @click="refetch()">
          Try again
        </UButton>
      </div>
      <p v-else-if="!letters.length" class="text-center text-sm text-primary-200/70">
        Nothing in the queue right now.
      </p>
      <p v-else-if="!visible.length" class="text-center text-sm text-primary-200/70">
        No letters match these filters. Try a different status or stop.
      </p>

      <UCard
        v-for="l in visible"
        :key="l.id"
        :aria-label="`Letter from ${l.senderName}`"
        class="bg-paper"
        :ui="{ body: 'space-y-2' }"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex min-w-0 items-start gap-3">
            <UAvatar
              :alt="l.senderName"
              class="font-display ring-1 ring-inset"
              :style="{ 'background': theme(l.recipient)?.soft, 'color': theme(l.recipient)?.deep, '--tw-ring-color': theme(l.recipient)?.accent }"
            />
            <div class="min-w-0">
              <p class="truncate font-display font-medium text-neutral-900">
                {{ l.senderName }}
              </p>
              <p class="text-xs text-neutral-600">
                <span class="font-medium" :style="{ color: theme(l.recipient)?.deep }">{{ theme(l.recipient)?.label ?? l.recipient }}</span>
                · {{ stopCity(l.tourStop) }} · {{ l.visibility }} · {{ formatDate(l.createdAt) }}
              </p>
            </div>
          </div>

          <div class="flex shrink-0 items-center gap-1.5">
            <UBadge :class="statusBadgeClass(l.status)" class="capitalize">
              {{ l.status }}
            </UBadge>
          </div>
        </div>

        <ProseImg
          v-if="l.design?.photo"
          :src="`/${l.design.photo}`"
          alt="Postcard photo attached to this letter"
          class="w-full aspect-video border border-neutral-200 object-cover"
          loading="lazy"
        />

        <p class="whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
          {{ l.body }}
        </p>

        <OfficeLetterMusic
          v-if="l.design?.music"
          :music="l.design.music"
        />

        <p
          v-if="l.reviewer"
          class="text-xs text-neutral-600"
        >
          Reviewed by
          <span class="font-medium text-neutral-700">{{ l.reviewer.name }}</span>
        </p>

        <UFormField label="Internal notes" :ui="{ label: 'text-xs text-neutral-600' }">
          <template #hint>
            <span v-if="savingId === l.id" class="text-xs text-neutral-500">Saving…</span>
          </template>
          <div class="flex items-start gap-2">
            <UTextarea
              :model-value="noteValue(l.id, l.adminNotes)"
              placeholder="Visible to admins only…"
              :rows="1"
              autoresize
              size="sm"
              class="w-full"
              @update:model-value="notesDraft[l.id] = String($event ?? '')"
              @blur="saveNotes(l.id, l.adminNotes)"
            />
            <UButton
              size="sm"
              variant="soft"
              :loading="savingId === l.id"
              :disabled="noteValue(l.id, l.adminNotes) === (l.adminNotes ?? '')"
              @click="saveNotes(l.id, l.adminNotes)"
            >
              Save
            </UButton>
          </div>
        </UFormField>

        <div class="flex flex-wrap gap-2 pt-1">
          <UButton
            size="lg"
            class="text-secondary-950"
            :loading="savingId === l.id"
            :disabled="l.status === 'approved'"
            @click="updateLetter({ id: l.id, status: 'approved' })"
          >
            Approve
          </UButton>
          <UButton
            color="error"
            variant="outline"
            size="lg"
            class="text-error-700"
            :loading="savingId === l.id"
            :disabled="l.status === 'rejected'"
            @click="updateLetter({ id: l.id, status: 'rejected' })"
          >
            Reject
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            size="lg"
            :loading="savingId === l.id"
            :disabled="l.status === 'pending'"
            @click="updateLetter({ id: l.id, status: 'pending' })"
          >
            Reset
          </UButton>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>
