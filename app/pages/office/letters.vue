<script setup lang="ts">
import type { LetterRecipient, LetterStatus } from '#shared/letters/types'
import { todaysTourStop, TOUR_STOPS } from '#shared/letters/tour'
import { RECIPIENT_THEME } from '#shared/letters/visuals'

useHead({ title: 'Letters' })

const search = ref('')
const statusFilter = ref<LetterStatus | 'all'>('pending')
/** Show day: default to that stop's letters; otherwise all stops */
const stopFilter = ref<string>(todaysTourStop()?.id ?? 'all')

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

const statusItems = computed(() => ([
  { value: 'pending', label: `Pending (${counts.value.pending})` },
  { value: 'approved', label: `Approved (${counts.value.approved})` },
  { value: 'rejected', label: `Rejected (${counts.value.rejected})` },
  { value: 'all', label: `All statuses (${counts.value.all})` },
]))

const stopItems = [
  { value: 'all', label: 'All stops' },
  ...TOUR_STOPS.map(s => ({ value: s.id as string, label: s.city })),
]
const stopCity = (id: string) => TOUR_STOPS.find(s => s.id === id)?.city ?? id

const visible = computed(() => {
  const q = search.value.trim().toLowerCase()
  return letters.value.filter(l =>
    (statusFilter.value === 'all' || l.status === statusFilter.value)
    && (stopFilter.value === 'all' || l.tourStop === stopFilter.value)
    && (!q || l.senderName.toLowerCase().includes(q) || l.body.toLowerCase().includes(q)),
  )
})

const dateFormatter = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

function formatDate(value: string | number | Date) {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : dateFormatter.format(d)
}

function theme(recipient: string) {
  return RECIPIENT_THEME[recipient as LetterRecipient]
}

const STATUS_COLOR: Record<LetterStatus, 'warning' | 'success' | 'error'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
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
  <UDashboardPanel id="letters">
    <template #body>
      <div class="flex items-end">
        <div>
          <h1 class="font-display text-3xl tracking-tighter">
            Letters
          </h1>
          <p class="text-muted">
            Review what fans wrote before it goes public.
          </p>
        </div>
        <div class="ml-auto">
          <UBadge color="warning" variant="subtle" size="lg">
            {{ counts.pending }} pending
          </UBadge>
        </div>
      </div>

      <UCard :ui="{ body: 'p-3 lg:p-3' }">
        <div class="flex flex-wrap items-center gap-2">
          <UInput v-model="search" icon="ph:magnifying-glass" placeholder="Search sender or text..." class="flex-1 min-w-60 lg:max-w-60" />
          <USelect v-model="statusFilter" :items="statusItems" value-key="value" class="lg:ml-auto" />
          <USelect v-model="stopFilter" :items="stopItems" value-key="value" icon="ph:map-pin" />
        </div>
      </UCard>

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

      <div v-if="isPending" class="grid gap-4">
        <USkeleton v-for="n in 3" :key="n" class="h-52 w-full" />
      </div>

      <UEmpty
        v-else-if="error"
        icon="ph:warning-circle"
        title="Couldn't load the letter queue"
        description="Check your connection and try again."
      >
        <template #actions>
          <UButton
            color="neutral"
            variant="outline"
            label="Try again"
            icon="ph:arrow-counter-clockwise"
            @click="refetch()"
          />
        </template>
      </UEmpty>

      <UEmpty
        v-else-if="!visible.length"
        icon="ph:envelope-simple"
        :title="letters.length ? 'No letters match these filters' : 'Nothing in the queue'"
        :description="letters.length ? 'Try a different status or stop.' : 'New letters land here as fans send them.'"
      />

      <div v-else class="space-y-4">
        <UCard
          v-for="l in visible"
          :key="l.id"
          :aria-label="`Letter from ${l.senderName}`"
          :ui="{ body: 'grid gap-5 lg:grid-cols-[20rem_minmax(0,1fr)]' }"
        >
          <div class="space-y-3">
            <LetterPaper
              v-if="l.design"
              :recipient="(l.recipient as LetterRecipient)"
              :sender-name="l.senderName"
              :body="l.body"
              :design="l.design"
              :layout="l.design.format === 'postcard' ? 'postcard' : 'letter'"
              compact
            />
            <p v-else class="whitespace-pre-wrap text-sm leading-relaxed text-toned">
              {{ l.body }}
            </p>

            <img
              v-if="l.design?.photo"
              :src="`/${l.design.photo}`"
              alt="Postcard photo attached to this letter"
              class="w-full aspect-video rounded-md object-cover outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10"
              loading="lazy"
            >
          </div>

          <div class="flex flex-col gap-4">
            <div class="flex items-start gap-3">
              <UAvatar
                :alt="l.senderName"
                class="font-display ring-1 ring-inset"
                :style="{ 'background': theme(l.recipient)?.soft, 'color': theme(l.recipient)?.deep, '--tw-ring-color': theme(l.recipient)?.accent }"
              />
              <div class="min-w-0 flex-1">
                <p class="truncate font-display text-lg tracking-tight text-highlighted">
                  {{ l.senderName }}
                </p>
                <p class="text-xs text-muted">
                  <span class="font-medium" :style="{ color: theme(l.recipient)?.accent }">{{ theme(l.recipient)?.label ?? l.recipient }}</span>
                  · {{ stopCity(l.tourStop) }} · {{ l.visibility }} · {{ formatDate(l.createdAt) }}
                </p>
              </div>
              <UBadge :color="STATUS_COLOR[l.status]" variant="subtle" class="shrink-0 capitalize">
                {{ l.status }}
              </UBadge>
            </div>

            <OfficeLetterMusic v-if="l.design?.music" :music="l.design.music" />

            <UFormField label="Internal notes" :ui="{ label: 'text-xs text-muted' }">
              <template #hint>
                <span v-if="savingId === l.id" class="text-xs text-dimmed">Saving…</span>
              </template>
              <div class="flex items-start gap-2">
                <UTextarea
                  :model-value="noteValue(l.id, l.adminNotes)"
                  placeholder="Visible to admins only…"
                  :rows="2"
                  autoresize
                  class="w-full"
                  @update:model-value="notesDraft[l.id] = String($event ?? '')"
                  @blur="saveNotes(l.id, l.adminNotes)"
                />
                <UButton
                  color="neutral"
                  variant="soft"
                  :loading="savingId === l.id"
                  :disabled="noteValue(l.id, l.adminNotes) === (l.adminNotes ?? '')"
                  label="Save"
                  @click="saveNotes(l.id, l.adminNotes)"
                />
              </div>
            </UFormField>

            <div class="mt-auto flex flex-wrap items-center gap-2 border-t border-default pt-4">
              <UButton
                icon="ph:check"
                label="Approve"
                color="success"
                :loading="savingId === l.id"
                :disabled="l.status === 'approved'"
                @click="updateLetter({ id: l.id, status: 'approved' })"
              />
              <UButton
                icon="ph:x"
                label="Reject"
                color="error"
                variant="outline"
                :loading="savingId === l.id"
                :disabled="l.status === 'rejected'"
                @click="updateLetter({ id: l.id, status: 'rejected' })"
              />
              <UButton
                icon="ph:arrow-counter-clockwise"
                label="Reset"
                color="neutral"
                variant="ghost"
                :loading="savingId === l.id"
                :disabled="l.status === 'pending'"
                @click="updateLetter({ id: l.id, status: 'pending' })"
              />
              <p v-if="l.reviewer" class="ml-auto text-xs text-muted">
                Reviewed by <span class="font-medium text-toned">{{ l.reviewer.name }}</span>
              </p>
            </div>
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
