<script setup lang="ts">
defineProps<{
  networkName: string
  loading?: boolean
  error?: boolean
}>()

const emit = defineEmits<{
  submit: [password: string]
}>()

const password = ref('')

function onSubmit() {
  emit('submit', password.value)
}
</script>

<template>
  <div class="select-none w-full min-h-dvh flex justify-center items-center bg-primary-50 dark:bg-secondary-900 p-6">
    <UCard
      class="w-full max-w-sm text-center ring-0"
      :class="error && 'animate-shake'"
      :ui="{ body: 'space-y-5 p-7' }"
    >
      <UIcon name="ph:wifi-high-bold" class="mx-auto size-10 text-secondary" aria-hidden="true" />

      <div class="space-y-2">
        <h1 class="font-display text-2xl font-light text-highlighted">
          Join network
        </h1>
        <p class="text-sm text-muted">
          Enter the password for <strong class="text-highlighted">
            {{ networkName }}
          </strong>
        </p>
      </div>

      <UFormField label="Password" :ui="{ label: 'text-xs text-muted' }" size="xl">
        <UInput
          v-model="password"
          type="password"
          autofocus
          autocomplete="off"
          class="w-full"
          @keydown.enter.prevent="onSubmit"
        />
      </UFormField>

      <p v-if="error" class="text-sm text-error">
        Incorrect password. Try again.
      </p>

      <UButton
        :label="loading ? 'Connecting…' : 'Connect'"
        :icon="loading ? 'i-lucide-loader-circle' : undefined"
        :loading="loading"
        :disabled="loading || !password"
        block
        size="xl"
        color="primary"
        class="rounded-full py-3"
        @click="onSubmit"
      />
    </UCard>
  </div>
</template>
