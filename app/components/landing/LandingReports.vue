<script setup lang="ts">
import { motion } from 'motion-v'
import { scrollMotion } from '~/utils/motion'
</script>

<template>
  <UPageSection id="reports" class="scroll-mt-10 bg-primary-400 bg-[url('/images/textures/22.jpg')] bg-blend-overlay text-neutral-900 rip py-10 lg:py-16">
    <div class="grid gap-10 items-center">
      <motion.div class="space-y-4 text-center" v-bind="scrollMotion()">
        <h2 class="font-display font-medium text-3xl lg:text-5xl tracking-tight text-balance">
          Donations <span class="font-script">&amp;</span> Expenses
        </h2>
        <p class="text-lg text-neutral-700">
          Because you deserve to know where your support goes
        </p>
      </motion.div>

      <motion.div v-bind="scrollMotion(0.15)">
        <ReportsLedger />
      </motion.div>
    </div>
  </UPageSection>
</template>
