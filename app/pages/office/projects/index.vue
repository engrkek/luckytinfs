<script setup lang="ts">
import type { Campaign } from '#shared/types'
import { LazyOfficeProjectForm } from '#components'

useHead({ title: 'Projects' })

const overlay = useOverlay()
const projectForm = overlay.create(LazyOfficeProjectForm)
const isDesktop = useMediaQuery('(min-width: 768px)', { ssrWidth: 767 })

const { data: projects } = useFetch<Campaign[]>('/api/office/projects', { key: 'office-projects' })
</script>

<template>
  <UDashboardPanel id="projects">
    <template #body>
      <div class="flex">
        <div>
          <h1 class="font-display text-3xl tracking-tighter">
            Projects
          </h1>
          <p class="text-muted">
            Manage fan projects here.
          </p>
        </div>
        <div class="ml-auto">
          <UButton icon="ph:plus" label="New Project" @click="projectForm.open({ type: 'new' })" />
        </div>
      </div>

      <UCard v-if="isDesktop" :ui="{ body: 'p-0 lg:p-0' }">
        <div class="flex flex-wrap items-center gap-2 p-3">
          <UInput icon="ph:magnifying-glass" placeholder="Search projects..." class="flex-1 min-w-60 lg:max-w-60" />
        </div>

        <OfficeProjectTable v-if="projects" :projects="projects" />
      </UCard>

      <template v-else>
        <div v-if="projects && projects.length > 0" class="grid gap-2">
          <UInput icon="ph:magnifying-glass" placeholder="Search projects..." class="min-w-60" />

          <UPageCard v-for="project in projects" :key="project.id" :to="`/office/projects/${project.id}`">
            <h2 class="font-display font-bold text-xl tracking-tighter">
              {{ project.title }}
            </h2>
          </UPageCard>
        </div>

        <UEmpty v-else icon="ph:folder-simple" title="No projects yet" description="Create one to start a fan project." />
      </template>
    </template>
  </UDashboardPanel>
</template>
