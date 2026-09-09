<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'
import type { Campaign, Tier } from '#shared/types'
import { LazyAppDialog, LazyOfficeProjectForm, LazyOfficeTierForm } from '#components'

const id = useRoute().params.id

const overlay = useOverlay()
const projectForm = overlay.create(LazyOfficeProjectForm)
const tierForm = overlay.create(LazyOfficeTierForm)
const deleteConfirm = overlay.create(LazyAppDialog)
const toast = useToast()

const { data: project } = useFetch<Campaign>(`/api/office/projects/${id}`, { key: `project-${id}` })
const { donations } = useOfficeDonations()
const { data: allTiers, refresh: refreshTiers } = useFetch<Tier[]>('/api/office/tiers', { key: 'office-tiers' })

const title = computed(() => project.value?.title)

const projectDonations = computed(() => donations.value.filter(d => d.campaignId === id))
const tiers = computed(() => (allTiers.value ?? [])
  .filter(t => t.campaignId === id)
  .sort((a, b) => a.minAmount - b.minAmount))

const raised = computed(() => projectDonations.value
  .filter(d => d.status === 'approved')
  .reduce((sum, d) => sum + d.amount, 0))

const goalProgress = computed(() => project.value?.goal ? Math.min(100, (raised.value / project.value.goal) * 100) : 0)

function formatCurrency(cents: number) {
  return `₱${(cents / 100).toLocaleString()}`
}

async function deleteTier(tier: Tier) {
  const confirmed = await deleteConfirm.open({
    title: 'Delete tier',
    description: `This will permanently delete "${tier.name}". This cannot be undone.`,
    confirmLabel: 'Delete',
    color: 'error',
  })
  if (!confirmed)
    return

  try {
    await $fetch(`/api/office/tiers/${tier.id}`, { method: 'DELETE' })
    await refreshTiers()
  }
  catch (err) {
    const e = err as { data?: { statusMessage?: string }, message?: string }
    toast.add({
      icon: 'ph:x-circle',
      title: 'Delete failed',
      description: e.data?.statusMessage ?? e.message ?? 'Something went wrong',
      color: 'error',
    })
  }
}

const breadcrumbs = computed<BreadcrumbItem[]>(() => [
  { label: 'Projects', to: '/office/projects' },
  { label: project.value?.title, to: `/office/projects/${project.value?.id}` },
])

async function toggleStatus() {
  if (!project.value)
    return

  const status = project.value.status === 'open' ? 'closed' : 'open'
  try {
    project.value = await $fetch(`/api/office/projects/${id}`, {
      method: 'PATCH',
      body: { status },
    })
    await refreshNuxtData('office-projects')
  }
  catch (err) {
    const e = err as { data?: { statusMessage?: string }, message?: string }
    toast.add({
      icon: 'ph:x-circle',
      title: 'Update failed',
      description: e.data?.statusMessage ?? e.message ?? 'Something went wrong',
      color: 'error',
    })
  }
}

async function deleteProject() {
  const confirmed = await deleteConfirm.open({
    title: 'Delete project',
    description: `This will permanently delete "${project.value?.title}". This cannot be undone.`,
    confirmLabel: 'Delete',
    color: 'error',
  })
  if (!confirmed)
    return

  try {
    await $fetch(`/api/office/projects/${id}`, { method: 'DELETE' })
    await navigateTo('/office/projects')
  }
  catch (err) {
    const e = err as { data?: { statusMessage?: string }, message?: string }
    toast.add({
      icon: 'ph:x-circle',
      title: 'Delete failed',
      description: e.data?.statusMessage ?? e.message ?? 'Something went wrong',
      color: 'error',
    })
  }
}

useHead({
  title,
})
</script>

<template>
  <UDashboardPanel :id="`project-${id}`">
    <template v-if="project" #body>
      <UBreadcrumb :items="breadcrumbs" />

      <div class="flex flex-col lg:flex-row lg:items-center gap-2">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="font-display font-bold text-2xl tracking-tighter text-pretty">
              {{ project.title }}
            </h1>
            <UBadge :label="project.status" :color="project.status === 'open' ? 'success' : 'neutral'" variant="soft" class="capitalize" />
          </div>
          <p class="text-muted">
            {{ project.description }}
          </p>
        </div>

        <div class="lg:ml-auto flex flex-wrap items-center lg:justify-end gap-2">
          <UButton
            :icon="project.status === 'open' ? 'ph:lock' : 'ph:lock-open'"
            :label="project.status === 'open' ? 'Close project' : 'Reopen project'"
            color="neutral"
            variant="soft"
            @click="toggleStatus"
          />
          <UButton
            icon="ph:pencil"
            label="Edit project"
            color="neutral"
            variant="soft"
            @click="projectForm.open({ type: 'edit', project })"
          />
          <UButton
            icon="ph:trash"
            label="Delete project"
            color="error"
            variant="soft"
            @click="deleteProject"
          />
        </div>
      </div>

      <UCard v-if="project.goal">
        <div class="flex items-baseline justify-between mb-2">
          <p class="font-semibold text-lg">
            {{ formatCurrency(raised) }} <span class="text-muted font-normal text-sm">raised of {{ formatCurrency(project.goal) }} goal</span>
          </p>
          <p class="text-muted text-sm">
            {{ Math.floor(goalProgress) }}%
          </p>
        </div>
        <UProgress :model-value="goalProgress" />
      </UCard>

      <UCard :ui="{ body: 'p-0 lg:p-0' }">
        <div class="flex flex-wrap items-center justify-between gap-2 p-3">
          <h2 class="font-semibold text-lg">
            Donor Tiers
          </h2>
          <UButton icon="ph:plus" label="Add Tier" size="sm" @click="tierForm.open({ type: 'new', campaignId: project.id })" />
        </div>

        <div v-if="tiers.length > 0" class="grid gap-2 p-3 pt-0">
          <UPageCard v-for="tier in tiers" :key="tier.id">
            <div class="flex items-start justify-between gap-2">
              <div>
                <p class="font-bold">
                  {{ tier.name }} — {{ formatCurrency(tier.minAmount) }}
                </p>
                <p class="text-muted text-sm">
                  {{ tier.items.join(', ') }}
                </p>
              </div>
              <div class="flex gap-1 shrink-0">
                <UButton
                  icon="ph:pencil"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  @click="tierForm.open({ type: 'edit', campaignId: project.id, tier })"
                />
                <UButton
                  icon="ph:trash"
                  color="error"
                  variant="ghost"
                  size="sm"
                  @click="deleteTier(tier)"
                />
              </div>
            </div>
          </UPageCard>
        </div>
        <UEmpty
          v-else
          icon="ph:gift"
          title="No tiers yet"
          description="Add a tier to reward donors at a milestone."
          class="p-3"
        />
      </UCard>

      <UCard :ui="{ body: 'p-0 lg:p-0' }">
        <div class="flex flex-wrap items-center gap-2 p-3">
          <h2 class="font-semibold text-lg">
            Donations
          </h2>
        </div>
        <OfficeDonationTable :donations="projectDonations" />
      </UCard>
    </template>
  </UDashboardPanel>
</template>
