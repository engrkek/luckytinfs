<script setup lang="ts">
const columns = [{
  label: 'Navigation',
  children: [
    { label: 'About', to: '/#about' },
    { label: 'Fan Projects', to: '/#fan-projects' },
    { label: 'Events', to: '/#events' },
    { label: 'Reports', to: '/#reports' },
    { label: 'Login', to: '/login' },
  ],
}, {
  label: 'Legal',
  children: [
    { label: 'Terms of Service', to: '/terms' },
    { label: 'Privacy Policy', to: '/privacy' },
  ],
}]
</script>

<template>
  <UFooter class="bg-secondary-600 text-white">
    <template #top>
      <UContainer>
        <UFooterColumns
          :columns
          :ui="{
            label: 'font-display font-bold uppercase',
            link: 'text-primary-200 hover:text-primary',
          }"
        >
          <template #left>
            <div class="size-30 bg-white [mask:url(/images/logos/logo-square.png)_center/contain_no-repeat]" />
            <p>
              A dedicated fan support team for BINI Maloi & BINI Jhoanna.
            </p>
          </template>
        </UFooterColumns>
      </UContainer>
    </template>

    <template #left>
      <p class="text-sm text-pretty text-center lg:text-left">
        Crafted with 💛💙 by Lumities for Maloi, Jhoanna, BINI & Blooms.<br>Not affiliated with BINI, Star Music or ABS-CBN.
      </p>
    </template>
  </UFooter>
</template>
