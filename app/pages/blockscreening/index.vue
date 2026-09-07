<script setup lang="ts">
import { ref } from 'vue'

useHead({
  title: 'Block Screening Registration',
  meta: [
    { key: 'theme-color', name: 'theme-color', content: '#0f2038' },
  ],
  bodyAttrs: {
    class: 'overflow-x-hidden bg-secondary-950 text-primary-100 selection:bg-primary-300 selection:text-secondary-950',
  },
})

useSeoMeta({
  title: 'Block Screening Registration',
  description: 'Register for Luckytin Fan Support\'s \'Forgotten Island\' Block Screening event. Join us for a special movie screening!',
})

// Form fields state
const form = ref({
  fullName: '',
  nickname: '',
  email: '',
  mobile: '',
  primaryPlatform: '',
  primaryUsername: '',
  otherPlatform: '',
  otherUsername: '',
  childRegistration: 'sponsor', // 'sponsor' or 'bring'
  minorName: '',
  relationship: '',
  ack1: false,
  ack2: false,
  ack3: false,
  ack4: false,
})

// Validation errors state
const errors = ref({
  fullName: '',
  nickname: '',
  email: '',
  mobile: '',
  primaryPlatform: '',
  primaryUsername: '',
  minorName: '',
  relationship: '',
  acks: '',
})

// Submission states
const isSubmitted = ref(false)
const registrationId = ref('')
const submissionDate = ref('')
const isSubmitting = ref(false)
const dbError = ref('')

// Email validation helper
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(email)
}

// Generate unique Registration ID: LTFI-XXX
function generateRegistrationId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 3; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `LTFI-${result}`
}

// Handle Form Submission
async function handleSubmit() {
  // Reset errors
  errors.value = {
    fullName: '',
    nickname: '',
    email: '',
    mobile: '',
    primaryPlatform: '',
    primaryUsername: '',
    minorName: '',
    relationship: '',
    acks: '',
  }
  dbError.value = ''

  let hasError = false

  // A. Personal Information Validation
  if (!form.value.fullName.trim()) {
    errors.value.fullName = 'Full Name is required'
    hasError = true
  }
  if (!form.value.nickname.trim()) {
    errors.value.nickname = 'Nickname is required'
    hasError = true
  }
  if (!form.value.email.trim()) {
    errors.value.email = 'Email Address is required'
    hasError = true
  }
  else if (!isValidEmail(form.value.email)) {
    errors.value.email = 'Please enter a valid email address'
    hasError = true
  }
  if (!form.value.mobile.trim()) {
    errors.value.mobile = 'Mobile Number is required'
    hasError = true
  }

  // B. Social Media Validation
  if (!form.value.primaryPlatform) {
    errors.value.primaryPlatform = 'Primary platform is required'
    hasError = true
  }
  if (!form.value.primaryUsername.trim()) {
    errors.value.primaryUsername = 'Username or Profile Link is required'
    hasError = true
  }

  // C. Child Registration Validation
  if (form.value.childRegistration === 'bring') {
    if (!form.value.minorName.trim()) {
      errors.value.minorName = 'Minor\'s Full Name is required'
      hasError = true
    }
    if (!form.value.relationship.trim()) {
      errors.value.relationship = 'Relationship to Attendee is required'
      hasError = true
    }
  }

  // D. Acknowledgments Validation
  if (
    !form.value.ack1
    || !form.value.ack2
    || !form.value.ack3
    || !form.value.ack4
  ) {
    errors.value.acks = 'You must acknowledge and accept all rules before submitting'
    hasError = true
  }

  if (hasError) {
    // Scroll to the first error
    setTimeout(() => {
      const firstError = document.querySelector('.text-error')
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
    return
  }

  isSubmitting.value = true

  // Generate random Registration ID instantly
  const newId = generateRegistrationId()
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  try {
    await $fetch('/api/blockscreening/register', {
      method: 'POST',
      body: {
        id: newId,
        ...form.value,
      },
    })

    // Success path
    registrationId.value = newId
    submissionDate.value = today
    isSubmitted.value = true

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  catch (err: any) {
    console.error('Submission DB error:', err)
    dbError.value = err.data?.statusMessage || err.statusMessage || err.message || 'An error occurred while connecting to the registration database. Please try again.'

    // Scroll to database error
    setTimeout(() => {
      const errorEl = document.getElementById('supabase-error-box')
      if (errorEl) {
        errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
  }
  finally {
    isSubmitting.value = false
  }
}

// Copy Registration ID utility
const copied = ref(false)
function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  })
}
</script>

<template>
  <div class="min-h-dvh flex flex-col justify-between bg-secondary-900 bg-[url('/images/textures/06.jpg')] bg-blend-screen bg-cover bg-center overflow-x-hidden relative">
    <!-- Background overlay elements representing island breeze/vibe -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      <div class="absolute -top-12 -left-12 opacity-10 text-9xl">
        🌴
      </div>
      <div class="absolute top-1/4 -right-16 opacity-10 text-9xl">
        🌴
      </div>
      <div class="absolute bottom-12 -left-16 opacity-10 text-9xl">
        🌊
      </div>
      <div class="absolute top-1/2 left-4 opacity-5 text-9xl font-script text-white">
        Forgotten Island
      </div>
    </div>

    <!-- MAIN CONTAINER -->
    <div class="relative z-10 w-full max-w-2xl mx-auto px-4 py-8 sm:py-12 flex-1 flex flex-col justify-center">
      <!-- HERO BANNER -->
      <header class="text-center mb-8 flex flex-col items-center">
        <NuxtLink to="/blockscreening" class="hover:scale-105 transition-transform duration-300">
          <div
            class="size-28 sm:size-36 bg-primary-100 [mask:url(/images/logos/logo-square.png)_center/contain_no-repeat]"
            aria-hidden="true"
          />
        </NuxtLink>

        <p class="font-type text-xs sm:text-sm uppercase tracking-[0.25em] text-primary-300 mt-3">
          Special Fan Event
        </p>
        <h1 class="mt-2 text-3xl sm:text-5xl font-display text-primary-100 tracking-tighter text-balance">
          Forgotten Island
        </h1>
        <p class="font-script text-xl sm:text-3xl text-primary-200 mt-1 leading-none">
          Block Screening Registration
        </p>

        <!-- Movie Details Banner -->
        <div class="mt-4 flex flex-wrap gap-2 justify-center font-type text-[10px] sm:text-xs text-primary-100/70 border border-primary-100/10 bg-secondary-950/40 backdrop-blur-md rounded-full px-4 py-1.5 shadow-inner">
          <span class="flex items-center gap-1">
            <UIcon name="ph:film-strip" class="text-primary-300" /> Dreamworks
          </span>
          <span class="text-primary-100/30">•</span>
          <span class="flex items-center gap-1">
            <UIcon name="ph:certificate-bold" class="text-primary-300" /> Rated PG
          </span>
          <span class="text-primary-100/30">•</span>
          <span class="flex items-center gap-1">
            <UIcon name="ph:ticket-fill" class="text-primary-300" /> PhP1,500
          </span>
        </div>
      </header>

      <!-- REGISTRATION RECEIPT (IF SUBMITTED) -->
      <Transition name="fade-slide" mode="out-in">
        <div v-if="isSubmitted" class="space-y-6">
          <!-- RIPPED BOARDING PASS CARD -->
          <div class="rip bg-paper text-secondary-950 shadow-2xl overflow-hidden relative border border-[#f0e6d0]">
            <!-- Gingham beach towel strip header -->
            <div class="h-4 bg-gingham-yellow-blue w-full border-b border-[#ebdcb3]/30" />

            <div class="p-6 sm:p-8 space-y-6">
              <!-- Ticket Header with Stamp vibe -->
              <div class="flex justify-between items-start gap-4">
                <div class="space-y-1">
                  <span class="font-type text-[10px] uppercase tracking-widest text-[#8c7456] block">Luckytin Fan Support</span>
                  <h2 class="font-display text-2xl sm:text-3xl font-bold text-secondary-900 tracking-tight">
                    Registration Received! 🐥🐼🏝️
                  </h2>
                  <p class="text-xs text-secondary-900/60 font-sans">
                    Submitted on {{ submissionDate }}
                  </p>
                </div>

                <!-- Custom Stamp Look for Pending Review -->
                <div class="size-16 sm:size-20 border-2 border-dashed border-maloi-600 rounded-full flex flex-col items-center justify-center text-center p-1 rotate-12 bg-white/40 shadow-inner shrink-0">
                  <span class="font-type text-[8px] sm:text-[9px] uppercase tracking-wider text-maloi-600">LTFS</span>
                  <span class="font-display font-bold text-[10px] sm:text-[11px] text-maloi-600 leading-none my-0.5">PENDING</span>
                  <span class="font-type text-[7px] sm:text-[8px] text-maloi-600/80">REVIEW</span>
                </div>
              </div>

              <!-- Ticket Divider Dot Line -->
              <div class="border-t-2 border-dashed border-[#ebdcb3] my-4 relative">
                <div class="absolute -left-8 -top-2 size-4 rounded-full bg-secondary-900 bg-blend-screen shadow-inner" />
                <div class="absolute -right-8 -top-2 size-4 rounded-full bg-secondary-900 bg-blend-screen shadow-inner" />
              </div>

              <!-- BOARDING INFO (REGISTRATION ID) -->
              <div class="bg-secondary-50/50 border border-[#ebdcb3] p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left shadow-inner">
                <div class="space-y-1">
                  <span class="font-type text-[10px] uppercase tracking-wider text-[#8c7456]">Your Unique Pass ID</span>
                  <div class="font-type text-2xl sm:text-3xl font-bold tracking-widest text-secondary-900 flex items-center justify-center sm:justify-start gap-2">
                    {{ registrationId }}
                    <button
                      class="text-secondary-500 hover:text-secondary-700 transition-colors p-1"
                      title="Copy Registration ID"
                      @click="copyToClipboard(registrationId)"
                    >
                      <UIcon :name="copied ? 'ph:circle-notch' : 'ph:copy-bold'" class="size-5" :class="copied && 'animate-spin'" />
                    </button>
                  </div>
                  <p v-if="copied" class="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">
                    Copied to clipboard!
                  </p>
                </div>

                <div class="space-y-1 sm:text-right">
                  <span class="font-type text-[10px] uppercase tracking-wider text-[#8c7456] block">Initial Status</span>
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-maloi-50 text-maloi-700 border border-maloi-200">
                    <span class="size-2 rounded-full bg-maloi-500 animate-pulse" />
                    SUBMITTED: PENDING REVIEW
                  </span>
                </div>
              </div>

              <!-- CONFIRMATION SUMMARY -->
              <div class="space-y-3 text-sm text-secondary-900/80">
                <p class="leading-relaxed">
                  Your registration for Luckytin Fan Support's <strong>'Forgotten Island'</strong> Block Screening has been successfully received.
                </p>

                <!-- Box Details -->
                <div class="border border-[#ebdcb3]/60 bg-white/20 p-4 rounded-lg space-y-2 text-xs">
                  <div class="grid grid-cols-3 border-b border-[#ebdcb3]/30 pb-2">
                    <span class="font-semibold text-secondary-900/60 uppercase">Registrant</span>
                    <span class="col-span-2 text-secondary-900 font-medium">{{ form.fullName }} ({{ form.nickname }})</span>
                  </div>
                  <div class="grid grid-cols-3 border-b border-[#ebdcb3]/30 pb-2">
                    <span class="font-semibold text-secondary-900/60 uppercase">Social Review</span>
                    <span class="col-span-2 text-secondary-900 font-medium">{{ form.primaryPlatform }}: {{ form.primaryUsername }}</span>
                  </div>
                  <div class="grid grid-cols-3 pb-1">
                    <span class="font-semibold text-secondary-900/60 uppercase">Child Seat</span>
                    <span class="col-span-2 text-secondary-900 font-medium">
                      {{ form.childRegistration === 'sponsor' ? 'Sponsoring a charity child 🐥' : `Bringing own child 🐼: ${form.minorName} (${form.relationship})` }}
                    </span>
                  </div>
                </div>

                <div class="space-y-2 pt-2 text-xs text-[#8c7456] leading-relaxed border-l-2 border-maloi-600 pl-3">
                  <p>
                    ⚠️ Please note that your slot is <strong>not yet confirmed</strong>. All registrations will undergo LTFS verification.
                  </p>
                  <p>
                    📩 Approved registrants will receive an <strong>Initial Slot Confirmation Email</strong> containing payment instructions and reminders.
                  </p>
                  <p>
                    📌 Please keep your Registration ID for future reference and door verification.
                  </p>
                </div>
              </div>

              <!-- Ticket Divider Dot Line -->
              <div class="border-t-2 border-dashed border-[#ebdcb3] my-4 relative">
                <div class="absolute -left-8 -top-2 size-4 rounded-full bg-secondary-900 bg-blend-screen shadow-inner" />
                <div class="absolute -right-8 -top-2 size-4 rounded-full bg-secondary-900 bg-blend-screen shadow-inner" />
              </div>

              <!-- SIGN-OFF -->
              <div class="flex justify-between items-center">
                <div class="font-script text-xl text-secondary-700">
                  with love, LTFS 💛💙
                </div>
                <div class="font-type text-[9px] text-secondary-900/40 uppercase tracking-widest">
                  Forgotten Island 2026
                </div>
              </div>
            </div>

            <!-- Gingham beach towel strip footer -->
            <div class="h-4 bg-gingham-yellow-blue w-full border-t border-[#ebdcb3]/30" />
          </div>
        </div>

        <!-- REGISTRATION FORM -->
        <div v-else class="space-y-6">
          <div class="bg-paper text-secondary-950 p-6 sm:p-8 rounded-2xl shadow-2xl border border-[#f0e6d0] relative">
            <!-- Floating Palm Tree icon in corner -->
            <div class="absolute top-4 right-4 text-3xl opacity-20 pointer-events-none select-none">
              🌴
            </div>

            <div class="mb-6 space-y-2">
              <h2 class="font-display text-2xl sm:text-3xl text-secondary-900 tracking-tight">
                Event Registration Form
              </h2>
              <p class="text-xs sm:text-sm text-secondary-900/70 leading-relaxed font-sans">
                Please fill in the details below to register for the block screening. Ensure your details match your active accounts.
              </p>
            </div>

            <form class="space-y-6 text-sm" @submit.prevent="handleSubmit">
              <!-- SECTION A: PERSONAL INFORMATION -->
              <div class="space-y-4">
                <div class="flex items-center gap-1.5 border-b border-[#ebdcb3] pb-2">
                  <UIcon name="ph:user-bold" class="text-secondary-600 size-5" />
                  <h3 class="font-display text-lg font-bold text-secondary-900">
                    A. Personal Information
                  </h3>
                </div>

                <!-- Full Name -->
                <div class="space-y-1">
                  <label class="block font-semibold text-secondary-900">
                    Full Name <span class="text-red-500">*</span>
                  </label>
                  <UInput
                    v-model="form.fullName"
                    placeholder="Enter your registered full name"
                    size="md"
                    class="w-full text-secondary-950 bg-white/50 border border-[#ebdcb3]/60 focus:border-secondary-500 rounded-lg"
                  />
                  <p v-if="errors.fullName" class="text-xs text-error font-medium mt-1">
                    {{ errors.fullName }}
                  </p>
                </div>

                <!-- Nickname -->
                <div class="space-y-1">
                  <label class="block font-semibold text-secondary-900">
                    Nickname <span class="text-red-500">*</span>
                  </label>
                  <UInput
                    v-model="form.nickname"
                    placeholder="What should we call you?"
                    size="md"
                    class="w-full text-secondary-950 bg-white/50 border border-[#ebdcb3]/60 focus:border-secondary-500 rounded-lg"
                  />
                  <p v-if="errors.nickname" class="text-xs text-error font-medium mt-1">
                    {{ errors.nickname }}
                  </p>
                </div>

                <!-- Email Address -->
                <div class="space-y-1">
                  <label class="block font-semibold text-secondary-900">
                    Email Address <span class="text-red-500">*</span>
                  </label>
                  <UInput
                    v-model="form.email"
                    type="email"
                    placeholder="you@example.com"
                    size="md"
                    class="w-full text-secondary-950 bg-white/50 border border-[#ebdcb3]/60 focus:border-secondary-500 rounded-lg"
                  />
                  <p v-if="errors.email" class="text-xs text-error font-medium mt-1">
                    {{ errors.email }}
                  </p>
                </div>

                <!-- Mobile Number -->
                <div class="space-y-1">
                  <label class="block font-semibold text-secondary-900">
                    Mobile Number <span class="text-red-500">*</span>
                  </label>
                  <UInput
                    v-model="form.mobile"
                    type="tel"
                    placeholder="e.g. 0917XXXXXXX"
                    size="md"
                    class="w-full text-secondary-950 bg-white/50 border border-[#ebdcb3]/60 focus:border-secondary-500 rounded-lg"
                  />
                  <p v-if="errors.mobile" class="text-xs text-error font-medium mt-1">
                    {{ errors.mobile }}
                  </p>
                </div>

                <!-- REMINDER NOTIFICATION -->
                <div class="bg-maloi-50 border border-maloi-200 text-maloi-700 p-4 rounded-xl flex gap-3 shadow-inner">
                  <UIcon name="ph:info-bold" class="size-6 shrink-0 mt-0.5" />
                  <div class="space-y-1 text-xs">
                    <strong class="font-bold block text-sm">
                      Reminder:
                    </strong>
                    <p class="leading-relaxed">
                      Please double-check your email address and mobile number. All important registration and event updates will be sent through the contact information provided.
                    </p>
                  </div>
                </div>
              </div>

              <!-- SECTION B: SOCIAL MEDIA INFORMATION -->
              <div class="space-y-4 pt-4">
                <div class="flex items-center gap-1.5 border-b border-[#ebdcb3] pb-2">
                  <UIcon name="ph:share-network-bold" class="text-secondary-600 size-5" />
                  <h3 class="font-display text-lg font-bold text-secondary-900">
                    B. Social Media Information
                  </h3>
                </div>

                <p class="text-xs text-[#8c7456] leading-normal italic pl-1">
                  At least one active public social media account is required for LTFS review.
                </p>

                <!-- Primary Social Media Account -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-1">
                    <label class="block font-semibold text-secondary-900">
                      Primary Platform <span class="text-red-500">*</span>
                    </label>
                    <select
                      v-model="form.primaryPlatform"
                      class="w-full bg-white/50 text-secondary-950 border border-[#ebdcb3]/60 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-secondary-500"
                    >
                      <option value="" disabled>
                        Select platform
                      </option>
                      <option value="X">
                        X (Twitter)
                      </option>
                      <option value="Instagram">
                        Instagram
                      </option>
                      <option value="Facebook">
                        Facebook
                      </option>
                      <option value="TikTok">
                        TikTok
                      </option>
                    </select>
                    <p v-if="errors.primaryPlatform" class="text-xs text-error font-medium mt-1">
                      {{ errors.primaryPlatform }}
                    </p>
                  </div>

                  <div class="space-y-1">
                    <label class="block font-semibold text-secondary-900">
                      Username/Profile Link <span class="text-red-500">*</span>
                    </label>
                    <UInput
                      v-model="form.primaryUsername"
                      placeholder="e.g. @username or url"
                      size="md"
                      class="w-full text-secondary-950 bg-white/50 border border-[#ebdcb3]/60 focus:border-secondary-500 rounded-lg"
                    />
                    <p v-if="errors.primaryUsername" class="text-xs text-error font-medium mt-1">
                      {{ errors.primaryUsername }}
                    </p>
                  </div>
                </div>

                <!-- Secondary Social Media Account (Optional) -->
                <div class="border-t border-[#ebdcb3]/40 pt-4 mt-2">
                  <p class="text-xs font-semibold text-secondary-900/60 uppercase tracking-wider mb-2 block pl-1">
                    Other Social Media Accounts (Optional)
                  </p>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="space-y-1">
                      <label class="block text-secondary-900 text-xs">
                        Other Platform
                      </label>
                      <select
                        v-model="form.otherPlatform"
                        class="w-full bg-white/50 text-secondary-950 border border-[#ebdcb3]/60 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-secondary-500"
                      >
                        <option value="">
                          None
                        </option>
                        <option value="X">
                          X (Twitter)
                        </option>
                        <option value="Instagram">
                          Instagram
                        </option>
                        <option value="Facebook">
                          Facebook
                        </option>
                        <option value="TikTok">
                          TikTok
                        </option>
                      </select>
                    </div>

                    <div class="space-y-1">
                      <label class="block text-secondary-900 text-xs">
                        Username/Profile Link
                      </label>
                      <UInput
                        v-model="form.otherUsername"
                        placeholder="e.g. @username or url"
                        size="md"
                        :disabled="!form.otherPlatform"
                        class="w-full text-secondary-950 bg-white/50 border border-[#ebdcb3]/60 focus:border-secondary-500 rounded-lg disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- SECTION C: CHILD REGISTRATION -->
              <div class="space-y-4 pt-4">
                <div class="flex items-center gap-1.5 border-b border-[#ebdcb3] pb-2">
                  <UIcon name="ph:baby-bold" class="text-secondary-600 size-5" />
                  <h3 class="font-display text-lg font-bold text-secondary-900">
                    C. Child Registration
                  </h3>
                </div>

                <div class="bg-secondary-50 border border-[#ebdcb3]/50 p-4 rounded-xl space-y-2 text-xs text-secondary-900/80 leading-relaxed shadow-sm">
                  <p>
                    🎬 <strong>The film is rated PG.</strong>
                  </p>
                  <p>
                    🐥🐼 Attendees can either sponsor a child from Luckytin Fan Support’s chosen charity or bring their own child.
                  </p>
                </div>

                <!-- Child Sponsorship Radio Question -->
                <div class="space-y-2">
                  <label class="block font-semibold text-secondary-900">
                    Will you be sponsoring or bringing a child? <span class="text-red-500">*</span>
                  </label>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                    <!-- Option 1: Sponsor -->
                    <label
                      class="flex items-center gap-3 p-3 rounded-xl border border-[#ebdcb3] bg-white/40 cursor-pointer hover:bg-maloi-50/10 transition-colors"
                      :class="form.childRegistration === 'sponsor' && 'border-secondary-500 bg-jhoanna-50 ring-1 ring-secondary-500'"
                    >
                      <input
                        v-model="form.childRegistration"
                        type="radio"
                        value="sponsor"
                        class="size-4 text-secondary-600 focus:ring-secondary-500"
                      >
                      <div class="space-y-0.5">
                        <span class="block font-semibold text-secondary-900 text-xs">Sponsor a child 🐥</span>
                        <span class="block text-[11px] text-secondary-900/60">I will be sponsoring a child</span>
                      </div>
                    </label>

                    <!-- Option 2: Bring own -->
                    <label
                      class="flex items-center gap-3 p-3 rounded-xl border border-[#ebdcb3] bg-white/40 cursor-pointer hover:bg-maloi-50/10 transition-colors"
                      :class="form.childRegistration === 'bring' && 'border-secondary-500 bg-jhoanna-50 ring-1 ring-secondary-500'"
                    >
                      <input
                        v-model="form.childRegistration"
                        type="radio"
                        value="bring"
                        class="size-4 text-secondary-600 focus:ring-secondary-500"
                      >
                      <div class="space-y-0.5">
                        <span class="block font-semibold text-secondary-900 text-xs">Bring my own child 🎒</span>
                        <span class="block text-[11px] text-secondary-900/60">I will be bringing my own child</span>
                      </div>
                    </label>
                  </div>
                </div>

                <!-- Conditional Sponsor Child Info -->
                <Transition name="fade-slide">
                  <div v-if="form.childRegistration === 'sponsor'" class="border border-[#ebdcb3] bg-maloi-50/10 p-4 rounded-xl space-y-4 mt-2 flex flex-col sm:flex-row items-center gap-4">
                    <div class="shrink-0 w-28 flex justify-center p-2 bg-white rounded-lg shadow-sm border border-[#ebdcb3]/60">
                      <NuxtImg
                        src="/images/bahay-tuluyan.jpg"
                        alt="Bahay Tuluyan Logo"
                        draggable="false"
                        class="max-h-16 max-w-full object-contain"
                      />
                    </div>
                    <div class="space-y-1 text-xs text-secondary-900/80 leading-relaxed">
                      <p class="font-bold text-secondary-900">
                        Charity Sponsorship:
                      </p>
                      <p>
                        If you choose to sponsor a child, your ticket purchase will enable a child from <strong>BAHAY TULUYAN</strong> to experience the same magic you would have in the cinemas. Your purchase also entails the child goodies and inclusions that would benefit them in and beyond the block screening.
                      </p>
                    </div>
                  </div>
                </Transition>

                <!-- Conditional Bring Child Info -->
                <Transition name="fade-slide">
                  <div v-if="form.childRegistration === 'bring'" class="border border-[#ebdcb3] bg-maloi-50/10 p-4 rounded-xl space-y-4 mt-2 flex flex-col sm:flex-row items-center gap-4">
                    <div class="space-y-1 text-xs text-secondary-900/80 leading-relaxed">
                      <p class="font-bold text-secondary-900">
                        Inclusions:
                      </p>
                      <p>
                        Your companion will receive the same inclusion as the sponsored kids from BAHAY TULUYAN. Please make
                        sure to be responsible and have your child with you at all times.
                      </p>
                    </div>
                  </div>
                </Transition>

                <!-- Conditional Bring Child Fields -->
                <Transition name="fade-slide">
                  <div v-if="form.childRegistration === 'bring'" class="border border-[#ebdcb3] bg-jhoanna-50/30 p-4 rounded-xl space-y-4 mt-2">
                    <p class="text-xs font-bold uppercase tracking-wider text-secondary-600 pl-1 mb-1">
                      👧 Minor Child Information
                    </p>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <!-- Minor Name -->
                      <div class="space-y-1">
                        <label class="block font-semibold text-secondary-900 text-xs">
                          Minor's Full Name <span class="text-red-500">*</span>
                        </label>
                        <UInput
                          v-model="form.minorName"
                          placeholder="Full name of minor"
                          size="md"
                          class="w-full text-secondary-950 bg-white border border-[#ebdcb3]/60 focus:border-secondary-500 rounded-lg"
                        />
                        <p v-if="errors.minorName" class="text-xs text-error font-medium mt-1">
                          {{ errors.minorName }}
                        </p>
                      </div>

                      <!-- Relationship -->
                      <div class="space-y-1">
                        <label class="block font-semibold text-secondary-900 text-xs">
                          Relationship to Attendee <span class="text-red-500">*</span>
                        </label>
                        <UInput
                          v-model="form.relationship"
                          placeholder="e.g. Parent, Guardian, Sibling"
                          size="md"
                          class="w-full text-secondary-950 bg-white border border-[#ebdcb3]/60 focus:border-secondary-500 rounded-lg"
                        />
                        <p v-if="errors.relationship" class="text-xs text-error font-medium mt-1">
                          {{ errors.relationship }}
                        </p>
                      </div>
                    </div>
                  </div>
                </Transition>
              </div>

              <!-- SECTION D: RULES & ACKNOWLEDGMENTS -->
              <div class="space-y-4 pt-4">
                <div class="flex items-center gap-1.5 border-b border-[#ebdcb3] pb-2">
                  <UIcon name="ph:shield-check-bold" class="text-secondary-600 size-5" />
                  <h3 class="font-display text-lg font-bold text-secondary-900">
                    D. Registration Rules &amp; Acknowledgments
                  </h3>
                </div>

                <p class="text-xs text-secondary-900/60 leading-normal mb-1">
                  Before submitting the form, registrants must acknowledge and agree to the following conditions:
                </p>

                <!-- Checkboxes -->
                <div class="space-y-3 pl-1">
                  <!-- Checkbox 1 -->
                  <label class="flex items-start gap-3 cursor-pointer group text-xs text-secondary-900/80 hover:text-secondary-950 leading-relaxed">
                    <input
                      v-model="form.ack1"
                      type="checkbox"
                      class="mt-1 size-4 rounded text-secondary-600 border-[#ebdcb3] focus:ring-secondary-500"
                    >
                    <span>
                      I understand that one person/one username/one account is entitled to <strong>one slot only</strong>.
                    </span>
                  </label>

                  <!-- Checkbox 2 -->
                  <label class="flex items-start gap-3 cursor-pointer group text-xs text-secondary-900/80 hover:text-secondary-950 leading-relaxed">
                    <input
                      v-model="form.ack2"
                      type="checkbox"
                      class="mt-1 size-4 rounded text-secondary-600 border-[#ebdcb3] focus:ring-secondary-500"
                    >
                    <span>
                      I understand that the event is strictly <strong>free seating</strong>.
                    </span>
                  </label>

                  <!-- Checkbox 3 -->
                  <label class="flex items-start gap-3 cursor-pointer group text-xs text-secondary-900/80 hover:text-secondary-950 leading-relaxed">
                    <input
                      v-model="form.ack3"
                      type="checkbox"
                      class="mt-1 size-4 rounded text-secondary-600 border-[#ebdcb3] focus:ring-secondary-500"
                    >
                    <span>
                      I confirm that all information provided in this registration is <strong>accurate and complete</strong>.
                    </span>
                  </label>

                  <!-- Checkbox 4 -->
                  <label class="flex items-start gap-3 cursor-pointer group text-xs text-secondary-900/80 hover:text-secondary-950 leading-relaxed">
                    <input
                      v-model="form.ack4"
                      type="checkbox"
                      class="mt-1 size-4 rounded text-secondary-600 border-[#ebdcb3] focus:ring-secondary-500"
                    >
                    <span>
                      I understand that LTFS may review the publicly available social-media account/s I provide for event eligibility and registration verification purposes.
                    </span>
                  </label>
                </div>
                <p v-if="errors.acks" class="text-xs text-error font-medium mt-2">
                  {{ errors.acks }}
                </p>
              </div>

              <!-- DATABASE CONNECTION ERROR FEEDBACK -->
              <Transition name="fade-slide">
                <div v-if="dbError" id="supabase-error-box" class="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl space-y-3 shadow-inner">
                  <div class="flex gap-2.5 items-start">
                    <UIcon name="ph:warning-circle-bold" class="size-5 shrink-0 mt-0.5 text-red-600" />
                    <div class="space-y-1 text-xs">
                      <strong class="font-bold text-sm text-red-950 block">
                        Database Connection Error
                      </strong>
                      <p class="leading-relaxed text-red-800">
                        {{ dbError }}
                      </p>
                    </div>
                  </div>
                </div>
              </Transition>

              <!-- SUBMIT BUTTON -->
              <div class="pt-4 border-t border-[#ebdcb3] flex justify-end">
                <UButton
                  type="submit"
                  size="xl"
                  color="primary"
                  block
                  :disabled="isSubmitting"
                  class="rounded-full py-3 text-secondary-950 font-bold tracking-wide w-full relative overflow-hidden flex items-center justify-center gap-2 group shadow-lg"
                >
                  <span class="relative z-10 flex items-center gap-2">
                    <UIcon :name="isSubmitting ? 'ph:circle-notch' : 'ph:ticket-bold'" class="size-5" :class="isSubmitting && 'animate-spin'" />
                    {{ isSubmitting ? 'Submitting Registration…' : 'Submit Registration' }}
                  </span>
                  <div class="absolute inset-0 bg-maloi-400 -translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-0" />
                </UButton>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </div>

    <!-- FOOTER -->
    <footer class="relative z-10 border-t border-primary-100/10 px-4 py-5 bg-secondary-950/60 backdrop-blur-md">
      <p class="font-type text-[10px] sm:text-xs uppercase tracking-wide text-primary-100/80 text-center text-pretty max-w-xl mx-auto leading-relaxed">
        Crafted with 💛💙 by Lumities for Maloi, Jhoanna, BINI &amp; Blooms.
        <br>
        Not affiliated with BINI, Star Music, Abs-Cbn, or Dreamworks.
      </p>
    </footer>
  </div>
</template>

<style scoped>
/* Transitive animation styles for Vue */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

/* Custom error color styled like standard error */
.text-error {
  color: #c43b4d;
}

/* Custom form components style overrides if necessary */
input[type="checkbox"]:focus,
input[type="radio"]:focus {
  outline: none;
}
</style>
