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
</script>

<template>
  <div>
    <LandingHeader />

    <!-- Hero -->
    <section class="relative isolate bg-maloi-400 dark:bg-jhoanna-600 bg-[url('/images/textures/33.jpg')] dark:bg-[url('/images/textures/06.jpg')] bg-blend-multiply dark:bg-blend-screen bg-cover bg-center min-h-[calc(100dvh-64px)] overflow-hidden">
      <div class="select-none absolute inset-0 -z-10 font-script text-2xl xl:text-5xl text-justify opacity-15">
        Lagi lagi lagi nang umaawit Pag-ibig na naman ang usap usapan sa paligid ko paligid ko Ngunit kung nais mong malaman malaman 'Di naman ako nagrereklamo At ang katotohana'y 'di ko 'Di ko mapigilang mapangiti na lang minu-minuto minu-minuto Nakakabaliw na pag ibig Sigurado nang hindi papayag Aking pusong mapalayo sa'yo Oh baby baby baby Halika tara na sa'n mo ba gustong pumunta Sa bundok o dagat ba sa mga ulap kaya Walang problemang iisipin pa Kung ikaw naman ang laging makakasama Lagi nang umaawit Umaawit mula kusina hanggang sa sala Lagi lagi Lagi nang napapasabing Mahal kita mula umaga mukhang malala na Hanggang gabi pauwi at bago matulog nang mahimbing Naiisip kita lagi lagi lagi lagi Lagi lagi lagi lagi Pag-ibig nga naman 'pag ika'y tinamaan aatras pa ba hmm 'Kala mo'y 'di kailangan Ngunit ngayo'y 'di na kayang mag-isa At t'wing wala sa'yong piling Telepono ko ay puno ng usapang mahalaga sa'tin sa'tin Tipong magandang umaga o kumain ka na ba 'Pag narito ka na'y hindi maalis sa'yo ang aking tingin Oh baby baby baby Halika tara na sa'n mo ba gustong pumunta Luzon Visayas ba o Mindanao kaya Walang problemang iisipin pa Kung ikaw naman ang laging makakasama Lagi nang umaawit Umaawit mula kusina hanggang sa sala Lagi lagi Lagi nang napapasabing Mahal kita mula umaga mukhang malala na Hanggang gabi pauwi at bago matulog nang mahimbing Naiisip kita lagi lagi lagi lagi Lagi lagi lagi lagi Oh sa'yo lang naramdaman Ang 'di ko naman hinanap woah Oh ikaw pala ang araw sa likod ng ulap Ulap ulap woah Lagi nang umaawit Umaawit mula kusina hanggang sa sala Lagi nang napapasabing Mahal kita mula umaga mukhang malala na Hanggang gabi pauwi at bago matulog nang mahimbing Naiisip kita naiisip Lagi lagi lagi woah Lagi lagi lagi lagi lagi lagi Lagi lagi woah woah Lagi nang umaawit umaawit Lagi lagi Lagi lagi Lagi lagi Lagi lagi Lagi lagi Lagi lagi Lagi lagi
      </div>

      <div class="h-[calc(100dvh-64px)] flex flex-col items-center justify-center">
        <Stamp src="/images/022e9964845fdc67f7868e743618a9ac.jpg" alt="luckytin" />

        <div class="flex items-center gap-4 xl:gap-8">
          <UIcon name="custom:ltcon" class="size-22 xl:size-37" />
          <div class="text-shadow-md">
            <h1 class="font-script text-6xl xl:text-9xl">
              luckytin
            </h1>
            <p class="-mt-2 xl:-mt-4 xl:text-xl uppercase">
              fan support
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
