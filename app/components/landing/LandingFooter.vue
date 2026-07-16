<script setup lang="ts">
const columns = [{
  label: 'Navigation',
  children: [
    { label: 'About', to: '/#about' },
    { label: 'Fan Projects', to: '/#fan-projects' },
    { label: 'Reports', to: '/#reports' },
    { label: 'Office', to: '/office' },
  ],
}]
</script>

<template>
  <UFooter>
    <template #top>
      <UContainer>
        <UFooterColumns
          :columns
          :ui="{
            label: 'font-type uppercase',
            link: 'text-primary-100 hover:text-primary-300',
          }"
        >
          <template #left>
            <div class="size-30 bg-primary-100 [mask:url(/images/logos/logo-square.png)_center/contain_no-repeat]" />
            <p class="text-sm">
              A dedicated fan support team for BINI Maloi & BINI Jhoanna.
            </p>
          </template>
        </UFooterColumns>
      </UContainer>
    </template>

    <template #left>
      <p class="text-xs font-type uppercase text-pretty text-center xl:text-left">
        Crafted with 💛💙 by Lumities for Maloi, Jhoanna, BINI & Blooms.<br>Not affiliated with BINI, Star Music or ABS-CBN.
      </p>
    </template>
  </UFooter>
</template>
