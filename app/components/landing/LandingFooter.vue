<script setup lang="ts">
const columns = [{
  label: 'Navigation',
  children: [
    { label: 'About', to: '/#about' },
    { label: 'Fan Projects', to: '/#fan-projects' },
    { label: 'Reports', to: '/#reports' },
    { label: 'Login', to: '/login' },
  ],
}]
</script>

<template>
  <UFooter class="text-secondary">
    <template #top>
      <UContainer>
        <UFooterColumns
          :columns
          :ui="{
            label: 'font-display font-bold uppercase',
            link: 'text-secondary hover:text-secondary-100',
          }"
        >
          <template #left>
            <div class="size-30 bg-secondary text-secondary-100 [mask:url(/images/logos/logo-square.png)_center/contain_no-repeat]" />
            <p class="text-sm">
              A dedicated fan support team for BINI Maloi & BINI Jhoanna.
            </p>
          </template>
        </UFooterColumns>
      </UContainer>
    </template>

    <template #left>
      <p class="text-xs uppercase text-pretty text-center lg:text-left">
        Crafted with 💛💙 by Lumities for Maloi, Jhoanna, BINI & Blooms.<br>Not affiliated with BINI, Star Music or ABS-CBN.
      </p>
    </template>
  </UFooter>
</template>
