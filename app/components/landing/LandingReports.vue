<script setup lang="ts">
</script>

<template>
  <UPageSection id="reports" class="scroll-mt-10 bg-primary-400 bg-[url('/images/textures/22.jpg')] bg-blend-overlay text-neutral-900 rip py-10 lg:py-16">
    <div class="grid gap-10 items-center">
      <div class="space-y-4 text-center">
        <h2 class="font-display font-medium text-3xl lg:text-5xl tracking-tight text-balance">
          Donations <span class="font-script">&amp;</span> Expenses
        </h2>
        <p class="text-lg text-neutral-700">
          Because you deserve to know where your support goes
        </p>
      </div>

      <ReportsLedger />
    </div>
  </UPageSection>
</template>
