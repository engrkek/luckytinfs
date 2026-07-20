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

const { letters, isPending } = useOfficeLetters()
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

function theme(recipient: string) {
  return RECIPIENT_THEME[recipient as keyof typeof RECIPIENT_THEME]
}

function initials(name: string) {
  return name.trim().charAt(0).toUpperCase()
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
  <UContainer class="max-w-3xl py-6 space-y-5">
    <div class="space-y-1">
      <h1 class="font-display text-3xl text-primary-50 tracking-tight">
        the letter queue
      </h1>
    </div>

    <div role="tablist" aria-label="Filter letters by status" class="flex flex-wrap gap-2">
      <button
        v-for="f in FILTERS"
        :key="f.value"
        type="button"
        role="tab"
        :aria-selected="statusFilter === f.value"
        class="rounded-full border px-3.5 py-1.5 font-type text-xs uppercase tracking-[0.12em] transition-colors"
        :class="statusFilter === f.value
          ? 'border-primary-400 bg-primary-400 text-secondary-950'
          : 'border-secondary-800 bg-secondary-900/60 text-primary-200/70 hover:border-secondary-700'"
        @click="statusFilter = f.value"
      >
        {{ f.label }} ({{ counts[f.value] }})
      </button>
    </div>

    <div role="tablist" aria-label="Filter letters by tour stop" class="flex flex-wrap gap-2">
      <button
        v-for="s in [{ id: 'all', city: 'All stops' }, ...TOUR_STOPS]"
        :key="s.id"
        type="button"
        role="tab"
        :aria-selected="stopFilter === s.id"
        class="rounded-full border px-3.5 py-1.5 font-type text-xs uppercase tracking-[0.12em] transition-colors"
        :class="stopFilter === s.id
          ? 'border-primary-400 bg-primary-400 text-secondary-950'
          : 'border-secondary-800 bg-secondary-900/60 text-primary-200/70 hover:border-secondary-700'"
        @click="stopFilter = s.id"
      >
        {{ s.city }}
      </button>
    </div>

    <div class="overflow-hidden rounded-2xl bg-[#f7f4ee]" aria-live="polite">
      <p v-if="isPending" class="p-6 text-center text-sm text-neutral-600">
        Loading…
      </p>
      <p v-else-if="!visible.length" class="p-6 text-center text-sm text-neutral-600">
        No letters here.
      </p>

      <div
        v-for="(l, i) in visible"
        :key="l.id"
        class="space-y-3 p-4 sm:p-5"
        :class="{ 'border-t border-neutral-200': i > 0 }"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex min-w-0 items-start gap-3">
            <span
              class="grid size-9 shrink-0 place-items-center rounded-full font-display text-sm font-medium"
              :style="{ background: theme(l.recipient)?.soft, color: theme(l.recipient)?.deep }"
            >
              {{ initials(l.senderName) }}
            </span>
            <div class="min-w-0">
              <p class="truncate font-medium text-neutral-900">
                {{ l.senderName }}
              </p>
              <p class="text-xs text-neutral-600">
                {{ theme(l.recipient)?.label ?? l.recipient }} · {{ stopCity(l.tourStop) }} · {{ l.visibility }} · {{ dateFormatter.format(new Date(l.createdAt)) }}
              </p>
            </div>
          </div>

          <div class="flex shrink-0 items-center gap-1.5">
            <UBadge
              :color="l.status === 'approved' ? 'success' : l.status === 'rejected' ? 'error' : 'warning'"
              variant="subtle"
              class="capitalize"
            >
              {{ l.status }}
            </UBadge>
          </div>
        </div>

        <img
          v-if="l.design?.photo"
          :src="`/${l.design.photo}`"
          alt="Postcard photo (needs review)"
          class="h-28 w-42 rounded-lg border border-neutral-200 object-cover"
          loading="lazy"
        >

        <p class="whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
          {{ l.body }}
        </p>

        <OfficeLetterMusic
          v-if="l.design?.music"
          :music="l.design.music"
        />

        <p
          v-if="l.reviewer"
          class="text-xs text-neutral-500"
        >
          Reviewed by
          <span class="font-medium text-neutral-700">{{ l.reviewer.name }}</span>
        </p>

        <UFormField label="Internal notes" :ui="{ label: 'text-xs text-neutral-500' }">
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
        </UFormField>

        <div class="flex flex-wrap gap-2 pt-1">
          <UButton
            color="primary"
            variant="solid"
            size="lg"
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
      </div>
    </div>
  </UContainer>
</template>
