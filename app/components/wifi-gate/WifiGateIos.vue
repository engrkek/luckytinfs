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
  <div class="relative min-h-dvh bg-default px-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] font-[-apple-system,BlinkMacSystemFont,sans-serif] text-highlighted">
    <div class="flex justify-between items-center px-5 pt-3 text-sm font-semibold" aria-hidden="true">
      <p class="text-[15px] font-semibold tracking-tight">
        11:11
      </p>

      <div class="flex items-center justify-end gap-1">
        <UIcon name="ph:cell-signal-full-bold" class="size-4" />
        <span class="text-[15px] tracking-tight">5G</span>
        <UIcon name="ph:battery-high-fill" class="size-6" />
      </div>
    </div>

    <UCard
      class="mx-2.5 mt-3.5 flex min-h-[calc(100dvh-56px-env(safe-area-inset-top))] flex-col rounded-[18px] border-0 bg-elevated ring-0"
      :class="error && 'animate-shake'"
      :ui="{ body: 'flex flex-1 flex-col p-0' }"
    >
      <div class="flex items-center justify-between px-3.5 pt-3.5">
        <UButton
          icon="i-lucide-x"
          variant="soft"
          color="neutral"
          size="xl"
          square
          aria-label="Cancel"
          class="flex size-10 items-center justify-center rounded-full ring-0"
          @click="onCancel"
        />
        <UButton
          :icon="loading ? 'i-lucide-loader-circle' : 'i-lucide-check'"
          variant="soft"
          color="neutral"
          size="xl"
          square
          aria-label="Join"
          class="flex size-10 items-center justify-center rounded-full ring-0 disabled:opacity-35"
          :loading="loading"
          :disabled="loading || !password"
          @click="onSubmit"
        />
      </div>

      <div class="flex flex-1 flex-col items-center px-7 pb-10 pt-7 text-center">
        <UIcon name="i-lucide-wifi" class="mb-5 size-14 text-secondary" aria-hidden="true" />

        <h1 class="mb-2 text-[22px] font-bold leading-tight tracking-tight">
          Join “{{ networkName }}”
        </h1>
        <p class="mb-6 max-w-70 text-[15px] leading-snug text-muted">
          Enter the password to join this Wi-Fi network.
        </p>

        <UInput
          v-model="password"
          type="password"
          variant="soft"
          size="xl"
          autofocus
          autocomplete="off"
          class="mb-4 w-full max-w-xs text-center rounded-full"
          :class="error && 'ring-1 ring-error'"
          :ui="{
            root: 'focus:ring-0 focus:outline-0',
            base: 'pl-22 bg-default hover:bg-default focus:bg-default focus-visible:outline-0 rounded-full',
          }"
          @keydown.enter.prevent="onSubmit"
        >
          <template #leading>
            Password
          </template>
        </UInput>

        <p v-if="error" class="mb-3 max-w-75 text-[13px] text-error">
          Unable to join the network “{{ networkName }}”.
        </p>
      </div>
    </UCard>
  </div>
</template>
