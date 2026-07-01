<script setup lang="ts">
defineProps<{
  networkName: string
  loading?: boolean
  error?: boolean
}>()

const emit = defineEmits<{
  submit: [password: string]
  cancel: []
}>()

const password = ref('')
const showPassword = ref(false)

function onSubmit() {
  if (!password.value)
    return
  emit('submit', password.value)
}

function onCancel() {
  emit('cancel')
}
</script>

<template>
  <div class="select-none flex min-h-dvh flex-col bg-default px-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] pt-[env(safe-area-inset-top)] font-roboto text-highlighted">
    <div class="flex items-center justify-between px-4 pt-2.5 text-[13px] font-semibold" aria-hidden="true">
      <span>2:45</span>
      <div class="flex items-center gap-1.5 text-xs">
        <UIcon name="i-material-symbols-alarm" class="size-3.5" />
        <UIcon name="i-lucide-wifi" class="size-4" />
        <UIcon name="i-material-symbols-signal-cellular-4-bar" class="size-4" />
        <span>30</span>
      </div>
    </div>

    <header class="grid grid-cols-[44px_1fr_44px] items-center px-2 pb-3 pt-1">
      <UButton
        icon="i-lucide-chevron-left"
        variant="ghost"
        color="neutral"
        size="md"
        square
        aria-label="Back"
        class="text-highlighted ring-0"
        @click="onCancel"
      />
      <h1 class="text-center text-[19px] font-bold leading-tight">
        {{ networkName }}
      </h1>
    </header>

    <div class="flex flex-1 flex-col px-5" :class="error && 'animate-shake'">
      <UFormField label="Password" class="py-3" :ui="{ label: 'text-sm text-secondary mb-2' }">
        <UInput
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Enter password"
          autofocus
          autocomplete="off"
          variant="none"
          class="w-full px-0 py-1 text-base ring-0"
          @keydown.enter.prevent="onSubmit"
        >
          <template #trailing>
            <UButton
              :icon="showPassword ? 'i-lucide-eye' : 'i-lucide-eye-off'"
              variant="ghost"
              color="neutral"
              size="xs"
              square
              class="text-muted ring-0"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              @click="showPassword = !showPassword"
            />
          </template>
        </UInput>
        <div class="mt-1.5 h-px bg-border" :class="error && 'bg-error'" />
      </UFormField>

      <p v-if="error" class="mb-4 text-xs text-error">
        Couldn't connect. Check password and try again.
      </p>

      <div class="mt-auto px-0 pt-4 pb-[calc(12px+env(safe-area-inset-bottom))]">
        <UButton
          :label="loading ? 'Connecting…' : 'Connect'"
          :icon="loading ? 'i-lucide-loader-circle' : undefined"
          :loading="loading"
          :disabled="loading || !password"
          block
          size="lg"
          color="secondary"
          class="rounded-[26px] py-3.5 text-base font-medium ring-0 disabled:opacity-45"
          @click="onSubmit"
        />
      </div>
    </div>
  </div>
</template>
