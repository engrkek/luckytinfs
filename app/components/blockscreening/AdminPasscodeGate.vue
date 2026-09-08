<script setup lang="ts">
const { loading = false, error = '' } = defineProps<{ loading?: boolean, error?: string }>()

const emit = defineEmits<{ submit: [password: string] }>()

const enteredPassword = ref('')

function handleSubmit() {
  if (!enteredPassword.value.trim())
    return
  emit('submit', enteredPassword.value)
}
</script>

<template>
  <div class="relative z-10 w-full max-w-md mx-auto px-4 py-16 flex-1 flex flex-col justify-center">
    <div class="rip bg-paper text-secondary-950 p-6 sm:p-8 rounded-2xl shadow-2xl border border-[#f0e6d0] relative">
      <div class="absolute top-4 right-4 text-3xl opacity-25 select-none pointer-events-none">
        🔐
      </div>

      <header class="text-center mb-6">
        <span class="font-mono text-[10px] uppercase tracking-widest text-[#8c7456] block">Luckytin Fan Support</span>
        <h2 class="font-display text-2xl font-bold text-secondary-900 tracking-tight mt-1">
          Console Passcode
        </h2>
        <p class="text-xs text-secondary-900/60 mt-1">
          Please enter the admin security password to unlock the database.
        </p>
      </header>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div class="space-y-1">
          <label class="block font-semibold text-secondary-900 text-xs uppercase tracking-wider">
            Passcode
          </label>
          <UInput
            v-model="enteredPassword"
            type="password"
            placeholder="••••••••"
            size="md"
            class="w-full text-secondary-950 bg-white border border-[#ebdcb3]/60 focus:border-secondary-500 rounded-lg text-sm"
            autofocus
          />
          <p v-if="error" class="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
            <UIcon name="ph:warning-circle" class="size-4 shrink-0" />
            <span>{{ error }}</span>
          </p>
        </div>

        <UButton
          type="submit"
          color="primary"
          class="w-full text-secondary-950 font-bold"
          size="md"
          icon="ph:lock-open"
          :loading
        >
          Unlock Console
        </UButton>
      </form>

      <div class="mt-6 pt-4 border-t border-[#ebdcb3]/40 flex justify-between items-center text-[10px] text-secondary-900/40 uppercase font-mono">
        <NuxtLink to="/blockscreening" class="hover:text-secondary-700 transition-colors">
          ← Registration Page
        </NuxtLink>
        <span>Forgotten Island 2026</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Beach rip ticket style */
.rip {
  background-image: radial-gradient(circle at 0px 50%, transparent 8px, #fdfbf7 8px),
                    radial-gradient(circle at 100% 50%, transparent 8px, #fdfbf7 8px);
  background-position: left, right;
  background-repeat: no-repeat;
}
</style>
