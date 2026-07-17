<script setup lang="ts">
import { isLetterRecipient } from '#shared/letters/public'

const route = useRoute()
const recipient = String(route.params.recipient || '')

await navigateTo(
  isLetterRecipient(recipient)
    ? { path: '/letters', query: { to: recipient } }
    : '/letters',
  { redirectCode: 301, replace: true },
)
</script>

<template>
  <div />
</template>
