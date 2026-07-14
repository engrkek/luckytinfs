<script setup lang="ts">
</script>

<template>
  <UPageSection id="reports" class="scroll-mt-10 bg-primary-100 text-secondary-900 rip py-10">
    <div>
      <h2 class="text-3xl font-display tracking-tighter">
        donations & expenses
      </h2>
      <p class="mt-4">
        Every peso accounted for.
      </p>
    </div>

    <div class="grid lg:grid-cols-2 gap-8">
      <div class="max-w-sm w-full mx-auto bg-white text-neutral-900 font-type px-5 py-4 drop-shadow-sm">
        <div class="text-center uppercase">
          <h2 class="text-xs">
            Luckytin Fan Support
          </h2>
          <p class="text-sm font-bold">
            Donations // Income
          </p>
        </div>

        <USeparator type="dashed" class="my-2" :ui="{ border: 'border-neutral-900' }" />

        <div class="grid gap-2 divide-y divide-neutral-100">
          <!--  -->
        </div>

        <p class="text-sm text-muted text-center">
          No donations or income yet.
        </p>

        <USeparator type="dashed" class="my-2" :ui="{ border: 'border-neutral-900' }" />
      </div>

      <div class="max-w-sm w-full mx-auto bg-white text-neutral-900 font-type px-5 py-4 drop-shadow-sm">
        <div class="text-center uppercase">
          <h2 class="text-xs">
            Luckytin Fan Support
          </h2>
          <p class="text-sm font-bold">
            Expenses // OUT
          </p>
        </div>

        <USeparator type="dashed" class="my-2" :ui="{ border: 'border-neutral-900' }" />

        <div class="grid gap-2 divide-y divide-neutral-100">
          <!--  -->
        </div>

        <p class="text-sm text-muted text-center">
          No expenses yet.
        </p>

        <USeparator type="dashed" class="my-2" :ui="{ border: 'border-neutral-900' }" />
      </div>
    </div>
  </UPageSection>
</template>
