<script setup lang="ts">
import { motion } from 'motion-v'
import { scrollMotion, staggerMotion } from '~/utils/motion'

const logbook = [
  { label: 'Fan Projects', desc: 'freebies & fan-made goodies', to: '/#fan-projects' },
  { label: 'Online Letters', desc: 'your words, sent with love', to: '/letters' },
  { label: 'Block Screening', desc: 'watching & giving back together', to: '/blockscreening' },
  { label: 'Donation Drives', desc: 'support made transparent', to: '/#reports' },
]
</script>

<template>
  <UPageSection id="about" class="scroll-mt-10 bg-paper text-neutral-900 rip py-16 lg:py-20">
    <div class="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
      <motion.div class="space-y-4" v-bind="scrollMotion()">
        <h2 class="font-display font-medium text-3xl lg:text-5xl text-neutral-950 tracking-tight text-balance">
          We&rsquo;re <span class="italic">Luckytin Fan Support</span>
        </h2>
        <p class="text-lg text-neutral-700 text-pretty max-w-lg">
          Luckytin Fan Support started with something simple: <span class="font-bold">our love for Maloi and Jhoanna.</span>
        </p>
        <p class="text-lg text-neutral-700 text-pretty max-w-lg">
          As Lumities, we wanted a space where we could turn that love into something tangible, whether it’s a small freebie, a letter, a fan project, or an event we can share with fellow Lumities and Blooms.
        </p>
        <p class="text-lg text-neutral-700 text-pretty max-w-lg">
          This is our little way of celebrating them, supporting them, and giving back some of the love and joy they’ve given us.
        </p>
      </motion.div>

      <motion.div class="max-w-md w-full mx-auto lg:mx-0 lg:mt-4" v-bind="scrollMotion(0.1)">
        <div class="bg-white rotate-1 drop-shadow-xl px-6 py-6">
          <p class="font-type text-xs uppercase tracking-widest text-neutral-500 mb-3">
            what we run
          </p>
          <div class="grid gap-3">
            <motion.div v-for="(item, index) in logbook" :key="index" v-bind="staggerMotion(index)">
              <NuxtLink :to="item.to" class="group flex items-baseline gap-2">
                <span class="font-type text-sm text-neutral-400">0{{ index + 1 }}</span>
                <span class="font-casual font-bold text-3xl text-secondary-700 group-hover:text-secondary-900">{{ item.label }}</span>
                <span class="flex-1 h-px border-b border-dotted border-neutral-300 -translate-y-0.75" />
                <span class="shrink-0 text-sm text-neutral-500 text-right">{{ item.desc }}</span>
              </NuxtLink>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  </UPageSection>
</template>
