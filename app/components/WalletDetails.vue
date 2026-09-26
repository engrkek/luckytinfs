<script setup lang="ts">
import type { Channel } from '#shared/types'
import { fullAccountName } from '#shared/donations'

// Selected wallet: QR plus masked account name/number, tap to reveal, copy buttons
const props = defineProps<{ channel: Channel }>()

const revealed = ref(false)
watch(() => props.channel.id, () => {
  revealed.value = false
})

const { copy: copyAccountName, copied: accountNameCopied } = useClipboard()
const { copy: copyAccountIdentifier, copied: accountIdentifierCopied } = useClipboard()

function mask(value: string) {
  if (value.length <= 4)
    return '•'.repeat(value.length)
  return `${value.slice(0, 2)}${'•'.repeat(Math.min(value.length - 4, 10))}${value.slice(-2)}`
}

// Masks a wallet account name GCash-style, e.g. "Larra Mae" + "delos Santos" -> "La**a M** D."
// long words keep first 2 + last 1 chars, short words keep the first char, last name becomes an initial.
function maskName(c: Channel) {
  const first = c.accountName.trim().split(/\s+/).map(word => word.length <= 3
    ? `${word[0]}${'*'.repeat(word.length - 1)}`
    : `${word.slice(0, 2)}${'*'.repeat(word.length - 3)}${word.slice(-1)}`)
  return c.accountLastName ? `${first.join(' ')} ${c.accountLastName.trim()[0]}.` : first.join(' ')
}
</script>

<template>
  <div class="border-secondary-900/15 bg-secondary-50 flex items-center gap-4 rounded-md border p-4">
    <NuxtImg v-if="channel.qrUrl" :src="channel.qrUrl" class="size-40 shrink-0 rounded object-cover" />
    <div
      class="flex-1 cursor-pointer space-y-1 text-sm select-none"
      role="button"
      tabindex="0"
      :aria-pressed="revealed"
      aria-label="Toggle account details visibility"
      @click="revealed = !revealed"
      @keydown.enter="revealed = !revealed"
      @keydown.space.prevent="revealed = !revealed"
    >
      <p class="font-semibold text-sm text-muted uppercase">
        Account name
      </p>
      <div class="flex items-center gap-1">
        <p class="font-bold text-xl text-highlighted tracking-tighter text-pretty uppercase">
          {{ revealed ? fullAccountName(channel) : maskName(channel) }}
        </p>
        <UButton
          :icon="accountNameCopied ? 'ph:check' : 'ph:copy'"
          size="xs"
          color="neutral"
          variant="ghost"
          aria-label="Copy account name"
          class="px-2 py-1"
          @click.stop="copyAccountName(fullAccountName(channel))"
        />
      </div>
      <p class="mt-2 font-semibold text-sm text-muted uppercase">
        Account number
      </p>
      <div class="flex items-center gap-1">
        <p class="font-mono text-lg text-secondary-900/70 tabular-nums tracking-tight">
          {{ revealed ? channel.accountIdentifier : mask(channel.accountIdentifier) }}
        </p>
        <UButton
          :icon="accountIdentifierCopied ? 'ph:check' : 'ph:copy'"
          size="xs"
          color="neutral"
          variant="ghost"
          aria-label="Copy account number"
          class="px-2 py-1"
          @click.stop="copyAccountIdentifier(channel.accountIdentifier)"
        />
      </div>
      <p class="mt-2 flex items-center gap-1 text-sm text-secondary-900/50">
        <UIcon :name="revealed ? 'ph:eye-slash' : 'ph:eye'" class="size-3.5" />
        {{ revealed ? 'Tap to hide' : 'Tap to reveal' }}
      </p>
    </div>
  </div>
</template>
