<script setup lang="ts">
defineProps<{ social: { label: string, url?: string } }>()
</script>

<template>
  <!-- click.stop: rows that open a sheet on click shouldn't also fire when following the link -->
  <ULink
    v-if="social.url"
    :to="social.url"
    target="_blank"
    rel="noopener noreferrer"
    class="truncate hover:underline underline-offset-2"
    @click.stop
  >
    {{ social.label }}
  </ULink>
  <span v-else class="truncate">{{ social.label }}</span>
</template>
