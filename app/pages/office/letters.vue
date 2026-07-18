<script setup lang="ts">
import type { LetterStatus } from '#shared/letters/types'
import { RECIPIENT_THEME } from '#shared/letters/visuals'

useHead({ title: 'Letters' })

const FILTERS: { label: string, value: LetterStatus | 'all' }[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'All', value: 'all' },
]

interface OfficeLetter {
  id: string
  recipient: string
  senderName: string
  body: string
  visibility: string
  status: LetterStatus
  adminNotes: string | null
  featuredOn: number | string | null
  createdAt: number | string
}

const statusFilter = ref<LetterStatus | 'all'>('pending')

const { data, status: fetchStatus } = await useFetch('/api/office/letters')

const letters = computed<OfficeLetter[]>(() => data.value?.letters ?? [])

const counts = computed(() => {
  const c: Record<string, number> = { pending: 0, approved: 0, rejected: 0, all: letters.value.length }
  for (const l of letters.value) c[l.status] = (c[l.status] ?? 0) + 1
  return c
})

const visible = computed(() =>
  statusFilter.value === 'all' ? letters.value : letters.value.filter(l => l.status === statusFilter.value),
)

const dateFormatter = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

function theme(recipient: string) {
  return RECIPIENT_THEME[recipient as keyof typeof RECIPIENT_THEME]
}

function initials(name: string) {
  return name.trim().charAt(0).toUpperCase()
}

const toast = useToast()
const savingId = ref<string | null>(null)
const notesDraft = reactive<Record<string, string>>({})

async function updateLetter(id: string, body: Record<string, unknown>) {
  savingId.value = id
  try {
    const { letter: updated } = await $fetch(`/api/office/letters/${id}`, { method: 'PATCH', body })
    const index = letters.value.findIndex(l => l.id === id)
    if (index !== -1 && data.value)
      data.value.letters.splice(index, 1, updated)
  }
  catch (e) {
    const err = e as { data?: { statusMessage?: string } }
    toast.add({ title: 'Update failed', description: err.data?.statusMessage ?? 'Something went wrong', color: 'error' })
  }
  finally {
    savingId.value = null
  }
}

function saveNotes(id: string) {
  updateLetter(id, { adminNotes: notesDraft[id] ?? '' })
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

    <div class="overflow-hidden rounded-2xl bg-[#f7f4ee]" aria-live="polite">
      <p v-if="fetchStatus === 'pending'" class="p-6 text-center text-sm text-neutral-600">
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
                {{ theme(l.recipient)?.label ?? l.recipient }} · {{ l.visibility }} · {{ dateFormatter.format(new Date(l.createdAt)) }}
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
            <UBadge v-if="l.featuredOn" color="info" variant="subtle">
              featured
            </UBadge>
          </div>
        </div>

        <p class="whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
          {{ l.body }}
        </p>

        <UFormField label="Internal notes" :ui="{ label: 'text-xs text-neutral-500' }">
          <UTextarea
            v-model="notesDraft[l.id]"
            :default-value="l.adminNotes ?? ''"
            placeholder="Visible to admins only…"
            :rows="1"
            autoresize
            size="sm"
            class="w-full"
            @blur="saveNotes(l.id)"
          />
        </UFormField>

        <div class="flex flex-wrap gap-2 pt-1">
          <UButton
            color="primary"
            variant="solid"
            size="lg"
            :loading="savingId === l.id"
            :disabled="l.status === 'approved'"
            @click="updateLetter(l.id, { status: 'approved' })"
          >
            Approve
          </UButton>
          <UButton
            color="error"
            variant="outline"
            size="lg"
            :loading="savingId === l.id"
            :disabled="l.status === 'rejected'"
            @click="updateLetter(l.id, { status: 'rejected' })"
          >
            Reject
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            size="lg"
            :loading="savingId === l.id"
            :disabled="l.status === 'pending'"
            @click="updateLetter(l.id, { status: 'pending' })"
          >
            Reset
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            size="lg"
            :loading="savingId === l.id"
            @click="updateLetter(l.id, { featured: !l.featuredOn })"
          >
            {{ l.featuredOn ? 'Unfeature' : 'Feature today' }}
          </UButton>
        </div>
      </div>
    </div>
  </UContainer>
</template>
