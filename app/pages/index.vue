<script setup lang="ts">
useHead({
  meta: [
    { key: 'theme-color', name: 'theme-color', content: '#1f4072' },
  ],
  htmlAttrs: {
    class: 'scroll-smooth',
  },
  bodyAttrs: {
    class: 'overflow-x-hidden bg-secondary-900 text-primary-100 selection:bg-primary-300 selection:text-secondary-950',
  },
})

useSeoMeta({
  titleTemplate: 'Luckytin Fan Support',
  description: 'A dedicated fan support team for BINI Maloi & BINI Jhoanna',
})
</script>

<template>
  <div>
    <LandingHeader />

    <!-- Hero -->
    <section class="relative isolate bg-secondary-900 bg-[url('/images/textures/06.jpg')] bg-blend-screen bg-cover bg-center min-h-[calc(100dvh-64px)] overflow-hidden">
      <div class="select-none absolute inset-0 -z-10 font-script text-2xl xl:text-4xl text-justify opacity-15">
        Lagi lagi lagi nang umaawit Pag-ibig na naman ang usap usapan sa paligid ko paligid ko Ngunit kung nais mong malaman malaman 'Di naman ako nagrereklamo At ang katotohana'y 'di ko 'Di ko mapigilang mapangiti na lang minu-minuto minu-minuto Nakakabaliw na pag ibig Sigurado nang hindi papayag Aking pusong mapalayo sa'yo Oh baby baby baby Halika tara na sa'n mo ba gustong pumunta Sa bundok o dagat ba sa mga ulap kaya Walang problemang iisipin pa Kung ikaw naman ang laging makakasama Lagi nang umaawit Umaawit mula kusina hanggang sa sala Lagi lagi Lagi nang napapasabing Mahal kita mula umaga mukhang malala na Hanggang gabi pauwi at bago matulog nang mahimbing Naiisip kita lagi lagi lagi lagi Lagi lagi lagi lagi Pag-ibig nga naman 'pag ika'y tinamaan aatras pa ba hmm 'Kala mo'y 'di kailangan Ngunit ngayo'y 'di na kayang mag-isa At t'wing wala sa'yong piling Telepono ko ay puno ng usapang mahalaga sa'tin sa'tin Tipong magandang umaga o kumain ka na ba 'Pag narito ka na'y hindi maalis sa'yo ang aking tingin Oh baby baby baby Halika tara na sa'n mo ba gustong pumunta Luzon Visayas ba o Mindanao kaya Walang problemang iisipin pa Kung ikaw naman ang laging makakasama Lagi nang umaawit Umaawit mula kusina hanggang sa sala Lagi lagi Lagi nang napapasabing Mahal kita mula umaga mukhang malala na Hanggang gabi pauwi at bago matulog nang mahimbing Naiisip kita lagi lagi lagi lagi Lagi lagi lagi lagi Oh sa'yo lang naramdaman Ang 'di ko naman hinanap woah Oh ikaw pala ang araw sa likod ng ulap Ulap ulap woah Lagi nang umaawit Umaawit mula kusina hanggang sa sala Lagi nang napapasabing Mahal kita mula umaga mukhang malala na Hanggang gabi pauwi at bago matulog nang mahimbing Naiisip kita naiisip Lagi lagi lagi woah Lagi lagi lagi lagi lagi lagi Lagi lagi woah woah Lagi nang umaawit umaawit Lagi lagi Lagi lagi Lagi lagi Lagi lagi Lagi lagi Lagi lagi Lagi lagi
      </div>

      <div class="h-[calc(100dvh-64px)] flex flex-col items-center justify-center gap-8">
        <div class="-mt-10 max-w-lg flex flex-col items-center text-center">
          <div class="size-60 bg-primary-100 [mask:url(/images/logos/logo-square.png)_center/contain_no-repeat]" />
          <h1 class="text-3xl xl:text-4xl font-display text-inverted tracking-tighter text-balance">
            The fan support team for BINI Maloi & BINI Jhoanna
          </h1>
        </div>

        <div class="flex items-center">
          <Polaroid :image="{ src: '/images/Gj55Wlka0AAIpSD.jpeg', alt: 'maloi', class: 'scale-250 mt-30 xl:mt-40' }" :index="0" caption="lucky 💛" class="w-30 xl:w-40 aspect-2/3" />
          <Polaroid :image="{ src: '/images/0cd30cf9889fb86b359f83da6fb54d21.jpg', alt: 'luckytin-2', class: 'scale-170 mt-20' }" caption="two hearts, one wifi 💛💙" class="w-50 xl:w-60 aspect-2/3" />
          <Polaroid :image="{ src: '/images/Gj55WnbbIAAGy0Z.jpeg', alt: 'jhoanna', class: 'scale-250 mt-30 xl:mt-40' }" :index="1" caption="tintin 💙" class="w-30 xl:w-40 aspect-2/3" />
        </div>
      </div>
    </section>

    <UPageSection id="about" class="scroll-mt-10 bg-primary-100 text-secondary-900 rip">
      <div class="flex flex-col xl:flex-row items-start gap-8">
        <div class="flex-1 max-w-xl">
          <h2 class="text-3xl font-display tracking-tighter">
            a little about BINI
          </h2>
          <p class="mt-4 text-pretty">
            BINI (pronounced as bee-nee) is an eight-member Filipino girl group dubbed as "Nation's Girl Group" of the Philippines. They are behind the hit songs <i>Pantropiko</i>, <i>Salamin, Salamin</i>, and <i>Cherry On Top</i>. Their leader and main vocal are this whole site is about.
          </p>

          <div>
            <div
              class="w-70 h-40 bg-secondary-900 [mask:url(/images/logos/logo-hr.png)_center/contain_no-repeat]"
            />
            <p class="-mt-10">
              We are Lumities who giveaway freebies, host fan events, and charity drives in the duo's name.
            </p>
          </div>
        </div>

        <div class="flex items-center justify-cente mx-auto">
          <Polaroid :image="{ src: '/images/HLWNb9caYAAculb.jpeg', alt: 'maloi' }" :index="1" caption="Maloi 🐼" class="w-40 xl:w-70 aspect-square" />
          <Polaroid :image="{ src: '/images/HLWNialaQAAZCNp.jpeg', alt: 'jhoanna' }" :index="0" caption="Jhoanna 🐥" class="w-40 xl:w-70 aspect-square" />
        </div>
      </div>
    </UPageSection>

    <LandingProjects />

    <UPageSection id="reports" class="scroll-mt-10 bg-primary-100 text-secondary-900 rip py-10">
      <div>
        <h2 class="text-3xl font-display tracking-tighter">
          donations & expenses
        </h2>
        <p class="mt-4">
          Every peso accounted for.
        </p>
      </div>
    </UPageSection>

    <LandingFooter />
  </div>
</template>
