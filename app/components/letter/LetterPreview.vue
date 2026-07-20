<script setup lang="ts">
import type { LetterDesign, LetterRecipient } from '#shared/letters/types'

const props = defineProps<{
  recipient: LetterRecipient | null
  senderName: string
  body: string
  design: LetterDesign
}>()

const previewRecipient = computed(() => props.recipient ?? 'bini')
</script>

<template>
  <div class="space-y-3">
    <p class="text-xs font-medium text-muted uppercase tracking-wider">
      Live preview
    </p>
    <LetterPaper
      :recipient="previewRecipient"
      :sender-name="senderName"
      :body="body.trim() || 'Your letter will appear here…'"
      :design="design"
      compact
    />
  </div>
</template>
