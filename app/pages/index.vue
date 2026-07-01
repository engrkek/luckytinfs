<script setup lang="ts">
const colorMode = useColorMode()
const color = computed(() => colorMode.value === 'dark' ? '#192853' : '#ffe577')

useHead({
  titleTemplate: 'luckytin fan support',
  meta: [
    { key: 'theme-color', name: 'theme-color', content: color },
  ],
  bodyAttrs: {
    class: 'bg-maloi-300 text-jhoanna-600 dark:bg-jhoanna-600 dark:text-maloi-600',
  },
})

const polas = [
  {
    image: { src: '/images/022e9964845fdc67f7868e743618a9ac.jpg', alt: 'luckytin-1' },
  },
  {
    image: { src: '/images/15e94d285018bdaac5fe4d8403b5c5f3.jpg', alt: 'luckytin-2' },
  },
  {
    image: { src: '/images/0f4b3aa70c96d7b29810ac89dbe5aa00.jpg', alt: 'luckytin-3' },
  },
]
</script>

<template>
  <div>
    <UColorModeButton />

    <!-- Hero -->
    <section class="relative isolate bg-maloi-300 dark:bg-jhoanna-600 bg-[url('/images/textures/22.jpg')] bg-blend-multiply dark:bg-blend-soft-light bg-cover bg-center min-h-dvh overflow-hidden">
      <div class="select-none absolute inset-0 -z-10 font-script text-2xl xl:text-5xl text-justify opacity-30">
        Bangin ka ba? Kasi
        Nahuhulog na ako sa 'yo, naman kasi
        Unggoy ka ba? Kasi
        Sumasabit ka sa puso ko, naman kasi
        Pustiso ka ba? Kasi
        You know I can't smile without you
        Pagod na pagod na ako
        Maghapon ka na kasing tumatakbo sa isipan ko
        Kasi naman kasi

        Mahal kita
        Bagay tayong dalawa
        Papicture nga
        Para mapadevelop kita
        Hindi tayo tao, hindi rin tayo hayop
        Bagay tayo, bagay talaga

        Papupulis kita, kasi
        Ninakaw mo ang puso ko, naman kasi
        Kuto ka ba? Kasi
        Palagi ka sa ulo ko
        Naman kasi
        Apoy ka ba? Kasi
        Alab-alab I love you

        Magsalbabida ka nga
        Kasi baka malunod ka sa pag-ibig ko
        Kasi naman kasi
        You might also like
        Mahal Kita Kasi
        Mahal kita
        Bagay tayong dalawa
        Papicture nga
        Para mapadevelop kita
        Hindi tayo tao, hindi rin tayo hayop
        Bagay tayo, bagay talaga

        Kamukha mo si Papa P, Papa P
        P Papa P, Papa P
        P Papa P, Papa P

        Exam ka ba, kasi
        Sasagutin kita agad-agad, naman kasi
        Drugs ka ba? Kakaadik ka kasi, kasi, naman kasi
        Kulangot ka ba? You're really really hard to get
        Posporo ka ba? E di posporo rin ako
        Para match
        Kasi naman kasi
        Mahal kita
        Bagay tayong dalawa
        Papicture nga
        Para mapadevelop kita

        Hindi tayo tao, hindi rin tayo hayop
        Bagay tayo, bagay talaga
        Pustiso ka nga, kasi
        I really really can't smile without you
      </div>

      <div class="h-dvh flex flex-col items-center justify-center">
        <div class="flex justify-center items-center">
          <Polaroid
            v-for="(pola, index) in polas"
            :key="index"
            v-bind="pola"
            :index="index"
            size="size-32 xl:size-80"
          />
        </div>

        <h1 class="text-shadow-md">
          <span class="font-script text-6xl xl:text-9xl">luckytin</span><br><span class="xl:text-xl uppercase">fan support</span>
        </h1>
      </div>
    </section>
  </div>
</template>
