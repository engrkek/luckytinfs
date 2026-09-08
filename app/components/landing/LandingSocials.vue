<script setup lang="ts">
const socials = [
  { label: 'X', icon: 'ph:x-logo', to: 'https://x.com/luckytinfs', rotate: '-rotate-3' },
  { label: 'Instagram', icon: 'ph:instagram-logo', to: 'https://instagram.com/luckytinfs', rotate: 'rotate-2' },
  { label: 'Facebook', icon: 'ph:facebook-logo', to: 'https://facebook.com/luckytinfs', rotate: '-rotate-1' },
]
</script>

<template>
  <UPageSection class="bg-secondary-600 bg-[url('/images/textures/06.jpg')] bg-blend-screen text-white py-16 lg:py-20">
    <div class="text-center space-y-6">
      <div class="space-y-2">
        <h2 class="font-display font-medium text-3xl lg:text-5xl tracking-tight text-pretty">
          Follow our socials.
        </h2>
        <p class="text-white/80 font-medium text-lg">
          Updates, drops, and behind-the-scenes.
        </p>
      </div>

      <div class="flex flex-wrap items-center justify-center gap-4">
        <UButton
          v-for="social in socials"
          :key="social.label"
          :icon="social.icon"
          label="@luckytinfs"
          :aria-label="`@luckytinfs on ${social.label}`"
          :to="social.to"
          target="_blank"
          rel="noopener"
          size="xl"
          class="bg-white text-secondary-900 shadow-md hover:-translate-y-0.5 transition-transform px-5 py-3"
          :class="social.rotate"
        />
      </div>
    </div>
  </UPageSection>
</template>
