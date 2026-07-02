<script setup lang="ts">
const colorMode = useColorMode()
const color = computed(() => colorMode.value === 'dark' ? '#192853' : '#ffe577')

useHead({
  titleTemplate: 'luckytin fan support',
  meta: [
    { key: 'theme-color', name: 'theme-color', content: color },
  ],
  bodyAttrs: {
    class: 'bg-maloi-400 text-jhoanna-600 selection:bg-secondary-600 selection:text-primary-600 dark:bg-jhoanna-600 dark:text-maloi-600',
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
  {
    image: { src: '/images/0ee3ca6437fff4041783e676eacea836.jpg', alt: 'luckytin-4' },
  },
  {
    image: { src: '/images/0cd30cf9889fb86b359f83da6fb54d21.jpg', alt: 'luckytin-5' },
  },
  {
    image: { src: '/images/1cb488fafa01d606418effbaf584def1.jpg', alt: 'luckytin-6' },
  },
  {
    image: { src: '/images/2ea8dbcc9d5b8e0a061ab86174a10a94.jpg', alt: 'luckytin-7', class: 'object-top' },
  },
  {
    image: { src: '/images/35fd67387d692ffbc916ec264a347a1b.jpg', alt: 'luckytin-8' },
  },
]
</script>

<template>
  <div>
    <header>
      <UIcon name="custom:ltcon" />
      <UColorModeButton />
    </header>

    <!-- Hero -->
    <section class="relative isolate bg-maloi-400 dark:bg-jhoanna-600 bg-[url('/images/textures/33.jpg')] dark:bg-[url('/images/textures/06.jpg')] bg-blend-multiply dark:bg-blend-screen bg-cover bg-center min-h-dvh overflow-hidden">
      <div class="select-none absolute inset-0 -z-10 font-script text-2xl xl:text-5xl text-justify opacity-15">
        Lagi lagi lagi nang umaawit Pag-ibig na naman ang usap usapan sa paligid ko paligid ko Ngunit kung nais mong malaman malaman 'Di naman ako nagrereklamo At ang katotohana'y 'di ko 'Di ko mapigilang mapangiti na lang minu-minuto minu-minuto Nakakabaliw na pag ibig Sigurado nang hindi papayag Aking pusong mapalayo sa'yo Oh baby baby baby Halika tara na sa'n mo ba gustong pumunta Sa bundok o dagat ba sa mga ulap kaya Walang problemang iisipin pa Kung ikaw naman ang laging makakasama Lagi nang umaawit Umaawit mula kusina hanggang sa sala Lagi lagi Lagi nang napapasabing Mahal kita mula umaga mukhang malala na Hanggang gabi pauwi at bago matulog nang mahimbing Naiisip kita lagi lagi lagi lagi Lagi lagi lagi lagi Pag-ibig nga naman 'pag ika'y tinamaan aatras pa ba hmm 'Kala mo'y 'di kailangan Ngunit ngayo'y 'di na kayang mag-isa At t'wing wala sa'yong piling Telepono ko ay puno ng usapang mahalaga sa'tin sa'tin Tipong magandang umaga o kumain ka na ba 'Pag narito ka na'y hindi maalis sa'yo ang aking tingin Oh baby baby baby Halika tara na sa'n mo ba gustong pumunta Luzon Visayas ba o Mindanao kaya Walang problemang iisipin pa Kung ikaw naman ang laging makakasama Lagi nang umaawit Umaawit mula kusina hanggang sa sala Lagi lagi Lagi nang napapasabing Mahal kita mula umaga mukhang malala na Hanggang gabi pauwi at bago matulog nang mahimbing Naiisip kita lagi lagi lagi lagi Lagi lagi lagi lagi Oh sa'yo lang naramdaman Ang 'di ko naman hinanap woah Oh ikaw pala ang araw sa likod ng ulap Ulap ulap woah Lagi nang umaawit Umaawit mula kusina hanggang sa sala Lagi nang napapasabing Mahal kita mula umaga mukhang malala na Hanggang gabi pauwi at bago matulog nang mahimbing Naiisip kita naiisip Lagi lagi lagi woah Lagi lagi lagi lagi lagi lagi Lagi lagi woah woah Lagi nang umaawit umaawit Lagi lagi Lagi lagi Lagi lagi Lagi lagi Lagi lagi Lagi lagi Lagi lagi
      </div>

      <div class="h-dvh flex flex-col items-center justify-center">
        <UMarquee pause-on-hover :overlay="false" class="w-full py-4 -mx-8 sm:-mx-12 lg:-mx-16 [--duration:40s]">
          <Polaroid
            v-for="(pola, index) in polas"
            :key="index"
            v-bind="pola"
            :index="index"
            size="size-42 xl:size-80"
          />
        </UMarquee>
        <UMarquee reverse pause-on-hover :overlay="false" class="w-full py-4 -mx-8 sm:-mx-12 lg:-mx-16 [--duration:40s]">
          <Polaroid
            v-for="(pola, index) in polas"
            :key="index"
            v-bind="pola"
            :index="index"
            size="size-42 xl:size-80"
          />
        </UMarquee>

        <h1 class="text-shadow-md">
          <span class="font-script text-6xl xl:text-9xl">luckytin</span><br><span class="xl:text-xl uppercase">fan support</span>
        </h1>
      </div>
    </section>
  </div>
</template>
