<script setup lang="ts">
import { motion } from 'motion-v'
import { scrollMotion, staggerMotion } from '~/utils/motion'

const members = [
  {
    key: 'maloi',
    name: 'Maloi Ricalde',
    nickname: 'Lucky',
    photo: '/images/maloi-ss-osaka.jpeg',
    role: 'Main Vocal',
    zodiac: 'Gemini',
    birthday: 'May 27, 2002',
    emoji: '🐼',
    color: 'Yellow',
    fandom: 'Luckies',
    facts: [
      'Draws whenever she gets the chance, and lately, she’s been deep in her vintage era.',
      'Her cat Juyon is very much in charge of the household.',
    ],
    cardRotate: '-rotate-2',
    nicknameClass: 'text-maloi-800',
    badgeClass: 'border-maloi-400 text-maloi-700',
  },
  {
    key: 'jhoanna',
    name: 'Jhoanna Robles',
    nickname: 'Tintin',
    photo: '/images/jhoanna-ss-osaka.jpeg',
    role: 'Leader, Lead Vocal, Lead Rapper',
    zodiac: 'Aquarius',
    birthday: 'January 26, 2004',
    emoji: '🐥',
    color: 'Deep Blue',
    fandom: 'Amities',
    facts: [
      'Keeps a journal, runs a coffee shop and an Airbnb, and is quietly brewing something called “Burn Theory.”',
      'Her corgi Bambi is, naturally, the other leader of the house.',
    ],
    cardRotate: 'rotate-2',
    nicknameClass: 'text-jhoanna-600',
    badgeClass: 'border-jhoanna-400 text-jhoanna-700',
  },
]
</script>

<template>
  <UPageSection id="duo" class="bg-secondary-600 bg-[url('/images/textures/06.jpg')] bg-blend-screen scroll-mt-10">
    <div class="space-y-10 lg:space-y-14">
      <motion.div class="max-w-lg w-full mx-auto text-center space-y-2" v-bind="scrollMotion()">
        <h2 class="font-display font-medium text-3xl lg:text-5xl tracking-tight text-pretty">
          <span class="italic text-maloi-400">Lucky</span> <span class="font-script">&amp;</span> <span class="italic text-jhoanna-300">Tintin</span>
        </h2>
        <p class="text-lg text-white/80 text-pretty">
          The two at the heart of everything we do. Here’s a little more about Maloi, Jhoanna, and the bond that brought us all together.
        </p>
      </motion.div>

      <div class="grid sm:grid-cols-2 gap-8 lg:gap-12 max-w-3xl mx-auto">
        <motion.div
          v-for="(member, index) in members"
          :key="member.key"
          class="mx-2 sm:mx-0"
          v-bind="staggerMotion(index)"
        >
          <div
            class="bg-paper text-neutral-900 drop-shadow-xl px-6 py-8 flex flex-col items-center text-center"
            :class="member.cardRotate"
          >
            <div class="w-3/4 aspect-4/5">
              <Stamp
                :src="member.photo"
                :alt="`${member.name} (${member.nickname})`"
                class="w-full h-full drop-shadow-md"
              />
            </div>

            <h3 class="mt-5 font-display font-medium text-2xl tracking-tight">
              {{ member.name }}
            </h3>

            <p class="font-script italic text-2xl -mt-1" :class="member.nicknameClass">
              {{ member.nickname }}
            </p>

            <p class="font-type text-xs uppercase tracking-wide text-neutral-500 mt-2">
              {{ member.role }} of BINI
            </p>

            <div class="mt-3 inline-flex items-center gap-2 rounded-full border border-dashed px-3 py-1 font-type text-[11px] uppercase tracking-wide" :class="member.badgeClass">
              <span>{{ member.zodiac }}</span>
              <span class="opacity-40">·</span>
              <span>{{ member.birthday }}</span>
            </div>

            <p class="mt-3 text-sm text-neutral-500">
              {{ member.emoji }} <span class="font-bold text-neutral-700">{{ member.fandom }}</span>
            </p>

            <ul class="mt-5 space-y-2 text-left font-hand text-neutral-700 text-base">
              <li v-for="(fact, i) in member.facts" :key="i" class="flex gap-2">
                <UIcon name="ph:star-four-fill" class="mt-1 shrink-0 size-4 opacity-60" :class="member.nicknameClass" />
                <span>{{ fact }}</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  </UPageSection>
</template>
