<script setup lang="ts">
useSeoMeta({
  title: 'Privacy Policy',
  description: 'How Letters for Luckytin & BINI handles your information.',
})

useHead({
  meta: [
    { key: 'theme-color', name: 'theme-color', content: '#f6f0e2' },
  ],
})
</script>

<template>
  <div class="letter-stage letter-stage--paper relative z-1 min-h-dvh">
    <article class="relative z-1 mx-auto max-w-lg px-5 pt-10 pb-24 sm:pt-14">
      <header class="text-center">
        <NuxtLink
          to="/letters"
          class="inline-block font-type text-[0.55rem] uppercase tracking-[0.28em] text-[#a08c60] transition-colors hover:text-[#2c2416]"
        >
          ← Letters home
        </NuxtLink>
        <h1 class="mt-4 font-display text-[clamp(1.75rem,6vw,2.25rem)] font-medium tracking-tight leading-[1.15] text-[#2c2416]">
          Privacy Policy
        </h1>
        <p class="mt-2 font-type text-[0.55rem] uppercase tracking-[0.2em] text-[#a08c60]">
          Last updated · July 2026
        </p>
      </header>

      <div class="mt-10 space-y-8 text-sm leading-relaxed text-[#5c4f35]/90">
        <p class="text-pretty">
          This policy explains what
          <strong class="font-medium text-[#2c2416]">Luckytin Fan Support</strong>
          collects when you use
          <strong class="font-medium text-[#2c2416]">Letters for Luckytin &amp; BINI</strong>
          (the “Service”), and why.
          We keep it simple: we only collect what we need to run the mailboxes, and we don’t sell your information.
        </p>

        <section>
          <h2 class="font-display text-lg font-medium tracking-tight text-[#2c2416]">
            1. Who we are
          </h2>
          <p class="mt-2 text-pretty">
            The Service is a volunteer fan project run by Luckytin Fan Support.
            It is not affiliated with BINI, Star Music, or ABS-CBN.
          </p>
        </section>

        <section>
          <h2 class="font-display text-lg font-medium tracking-tight text-[#2c2416]">
            2. What we collect
          </h2>
          <p class="mt-2 text-pretty">
            Depending on how you use the Service, we may process:
          </p>
          <ul class="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong class="font-medium text-[#2c2416]">Letter content</strong>
              — your message, design choices (paper, stickers, seal, music link, and so on), and any postcard photo you upload.
            </li>
            <li>
              <strong class="font-medium text-[#2c2416]">Display name</strong>
              — optional. If you leave it blank, the letter may show as Anonymous.
            </li>
            <li>
              <strong class="font-medium text-[#2c2416]">Email</strong>
              — optional, for contact only. It is
              <strong class="font-medium text-[#2c2416]">never shown</strong>
              on public letters or to other fans.
            </li>
            <li>
              <strong class="font-medium text-[#2c2416]">Mailbox, tour stop, and visibility</strong>
              — who the letter is for, which show it travels with, and whether it is public or private.
            </li>
            <li>
              <strong class="font-medium text-[#2c2416]">Anonymous sender id</strong>
              — a random id stored in a cookie so we can enforce “one letter per mailbox per stop” without accounts.
            </li>
            <li>
              <strong class="font-medium text-[#2c2416]">Drafts on your device</strong>
              — unfinished letters may be saved in your browser’s local storage until you send or clear them. That stays on your device.
            </li>
            <li>
              <strong class="font-medium text-[#2c2416]">Technical data</strong>
              — standard server or hosting logs (for example IP address, browser type, and request times) used for security, abuse prevention, and keeping the site online.
            </li>
          </ul>
        </section>

        <section>
          <h2 class="font-display text-lg font-medium tracking-tight text-[#2c2416]">
            3. How we use it
          </h2>
          <ul class="mt-2 list-disc space-y-1.5 pl-5">
            <li>Deliver and display letters according to the visibility you chose.</li>
            <li>Moderate content before public appearance or member delivery.</li>
            <li>Enforce send limits and reduce spam or abuse.</li>
            <li>Contact you only if you left an email and we have a good reason (for example a problem with your letter).</li>
            <li>Operate, secure, and improve the Service.</li>
          </ul>
          <p class="mt-3 text-pretty">
            We do
            <strong class="font-medium text-[#2c2416]">not</strong>
            sell your personal information, and we do not use it for targeted advertising.
          </p>
        </section>

        <section>
          <h2 class="font-display text-lg font-medium tracking-tight text-[#2c2416]">
            4. Public vs private letters
          </h2>
          <p class="mt-2 text-pretty">
            <strong class="font-medium text-[#2c2416]">Public</strong>
            letters may appear in the community feed and be readable by other visitors after approval.
            Don’t put anything in a public letter that you wouldn’t want strangers to see.
          </p>
          <p class="mt-2 text-pretty">
            <strong class="font-medium text-[#2c2416]">Private</strong>
            letters are intended only for the recipient and the people who review submissions.
            Still avoid sensitive personal data — moderation is human, and no system is perfectly sealed.
          </p>
        </section>

        <section>
          <h2 class="font-display text-lg font-medium tracking-tight text-[#2c2416]">
            5. Cookies &amp; local storage
          </h2>
          <ul class="mt-2 list-disc space-y-1.5 pl-5">
            <li>
              <code class="rounded bg-[#2c2416]/6 px-1 py-0.5 font-type text-[0.7rem]">luckytin-sender</code>
              — anonymous browser id for send limits.
            </li>
            <li>
              Site access cookies (if the Wi‑Fi gate is enabled) so you don’t have to re-enter the password every visit.
            </li>
            <li>
              Optional sound preference and letter drafts stored locally in your browser.
            </li>
          </ul>
          <p class="mt-3 text-pretty">
            You can clear cookies and site data in your browser settings. Clearing the sender cookie may reset send-limit tracking for that browser.
          </p>
        </section>

        <section>
          <h2 class="font-display text-lg font-medium tracking-tight text-[#2c2416]">
            6. Who else sees data
          </h2>
          <p class="mt-2 text-pretty">
            We use infrastructure providers to host the Service (for example cloud hosting and storage).
            They process data only to run the site for us.
          </p>
          <p class="mt-2 text-pretty">
            If you attach a YouTube music link, YouTube / Google may process that request under their own policies when the player loads.
            We don’t control third-party media players.
          </p>
          <p class="mt-2 text-pretty">
            Approved public letters are visible to other users of the Service.
            Private letters and optional emails are not shown in the public feed.
          </p>
        </section>

        <section>
          <h2 class="font-display text-lg font-medium tracking-tight text-[#2c2416]">
            7. How long we keep it
          </h2>
          <p class="mt-2 text-pretty">
            We keep letters for as long as the project needs them (for example for the tour and a reasonable period after),
            or until we remove them for moderation, cleanup, or a valid deletion request.
            Technical logs are kept only as long as needed for security and operations.
          </p>
        </section>

        <section>
          <h2 class="font-display text-lg font-medium tracking-tight text-[#2c2416]">
            8. Your choices
          </h2>
          <ul class="mt-2 list-disc space-y-1.5 pl-5">
            <li>Skip optional name and email.</li>
            <li>Choose private visibility if you don’t want a letter in the public feed.</li>
            <li>Clear drafts, cookies, and site data from your browser.</li>
            <li>
              Ask us to remove a letter you sent when you can reasonably identify it
              (for example via the optional email you used, or enough detail for us to find it).
            </li>
          </ul>
        </section>

        <section>
          <h2 class="font-display text-lg font-medium tracking-tight text-[#2c2416]">
            9. Children
          </h2>
          <p class="mt-2 text-pretty">
            The Service is aimed at a general fan audience.
            If you are a parent or guardian and believe a child has submitted personal information they shouldn’t have,
            contact us and we will do our best to remove it.
          </p>
        </section>

        <section>
          <h2 class="font-display text-lg font-medium tracking-tight text-[#2c2416]">
            10. Security
          </h2>
          <p class="mt-2 text-pretty">
            We take reasonable steps to protect data, but no website is perfectly secure.
            Please don’t put highly sensitive information (passwords, government IDs, financial details) in a letter.
          </p>
        </section>

        <section>
          <h2 class="font-display text-lg font-medium tracking-tight text-[#2c2416]">
            11. Changes
          </h2>
          <p class="mt-2 text-pretty">
            We may update this policy. The “Last updated” date at the top will change when we do.
            Continued use after an update means you accept the revised policy.
          </p>
        </section>

        <section>
          <h2 class="font-display text-lg font-medium tracking-tight text-[#2c2416]">
            12. Terms
          </h2>
          <p class="mt-2 text-pretty">
            Use of the Service is also subject to our
            <NuxtLink to="/letters/terms" class="font-medium text-[#2c2416] underline decoration-[#d8cba8] underline-offset-2 hover:decoration-[#2c2416]">
              Terms of Use
            </NuxtLink>.
          </p>
        </section>
      </div>

      <p class="mt-12 text-center font-type text-[0.55rem] uppercase tracking-[0.2em] text-[#a08c60]">
        <NuxtLink to="/letters/terms" class="hover:text-[#2c2416]">Terms</NuxtLink>
        <span class="mx-2 opacity-40">·</span>
        <NuxtLink to="/letters" class="hover:text-[#2c2416]">Letters home</NuxtLink>
      </p>
    </article>
  </div>
</template>
