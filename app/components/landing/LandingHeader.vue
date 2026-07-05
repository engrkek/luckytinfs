<script setup lang="ts"></script>

<template>
  <header class="sticky top-0 inset-x-0 z-50 bg-maloi-400 text-jhoanna-600 dark:bg-jhoanna-600 dark:text-maloi-600">
    <UContainer class="flex items-center justify-between gap-2 py-4">
      <NuxtLink to="/">
        <UIcon name="custom:ltcon" class="text-xl" />
      </NuxtLink>

      <UColorModeButton class="text-secondary-900 dark:text-primary-300" />
    </UContainer>
  </header>
</template>
