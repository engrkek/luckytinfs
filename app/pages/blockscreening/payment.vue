<script setup lang="ts">
import { ref } from 'vue'

useHead({
  title: 'Block Screening Payment Submission',
  meta: [
    { key: 'theme-color', name: 'theme-color', content: '#0f2038' },
  ],
  bodyAttrs: {
    class: 'overflow-x-hidden bg-secondary-950 text-primary-100 selection:bg-primary-300 selection:text-secondary-950',
  },
})

useSeoMeta({
  title: 'Block Screening Payment Submission',
  description: 'Submit your payment details for Luckytin Fan Support\'s \'Forgotten Island\' Block Screening event.',
})

// Form state
const form = ref({
  registrationId: '',
  paymentMode: [] as string[],
  referenceNo: '',
})

// Validation errors state
const errors = ref({
  registrationId: '',
  paymentMode: '',
  referenceNo: '',
})

// Submission and feedback states
const isSubmitted = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const verifiedRegistrant = ref({
  fullName: '',
  nickname: '',
})

// Validation helper
function validateForm(): boolean {
  let hasError = false

  errors.value = {
    registrationId: '',
    paymentMode: '',
    referenceNo: '',
  }
  errorMessage.value = ''

  // 1. Validate Registration ID
  const id = form.value.registrationId.trim()
  if (!id) {
    errors.value.registrationId = 'Registration/Pass ID is required.'
    hasError = true
  }
  else if (!/^LTFI-[A-Z0-9]{3}$/i.test(id)) {
    errors.value.registrationId = 'Please enter a valid Registration ID (e.g., LTFI-A1B).'
    hasError = true
  }

  // 2. Validate Mode of Payment
  if (form.value.paymentMode.length === 0) {
    errors.value.paymentMode = 'Please select at least one Mode of Payment.'
    hasError = true
  }

  // 3. Validate Reference Number
  if (!form.value.referenceNo.trim()) {
    errors.value.referenceNo = 'Payment reference number is required.'
    hasError = true
  }
  else if (form.value.referenceNo.trim().length < 4) {
    errors.value.referenceNo = 'Please enter a valid reference number.'
    hasError = true
  }

  return !hasError
}

// Handle Form Submission
async function handleSubmit() {
  if (!validateForm()) {
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
  errorMessage.value = ''

  try {
    const response = await $fetch('/api/blockscreening/payment', {
      method: 'POST',
      body: {
        id: form.value.registrationId.trim().toUpperCase(),
        paymentMode: form.value.paymentMode,
        paymentReference: form.value.referenceNo.trim(),
      },
    })

    if (response.success) {
      verifiedRegistrant.value = {
        fullName: response.fullName,
        nickname: response.nickname,
      }
      isSubmitted.value = true
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
  catch (err: any) {
    console.error('Payment submission error:', err)
    errorMessage.value = err.data?.statusMessage || err.statusMessage || err.message || 'An error occurred during submission. Please try again.'

    // Scroll to error box
    setTimeout(() => {
      const errorEl = document.getElementById('error-box')
      if (errorEl) {
        errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
  }
  finally {
    isSubmitting.value = false
  }
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
          Payment Submission Form
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

      <!-- PAYMENT RECEIPT (IF SUBMITTED) -->
      <Transition name="fade-slide" mode="out-in">
        <div v-if="isSubmitted" class="space-y-6">
          <div class="rip bg-paper text-secondary-950 shadow-2xl overflow-hidden relative border border-[#f0e6d0]">
            <!-- Gingham beach towel strip header -->
            <div class="h-4 bg-gingham-yellow-blue w-full border-b border-[#ebdcb3]/30" />

            <div class="p-6 sm:p-8 space-y-6">
              <!-- Ticket Header with Stamp vibe -->
              <div class="flex justify-between items-start gap-4">
                <div class="space-y-1">
                  <span class="font-type text-[10px] uppercase tracking-widest text-[#8c7456] block">Luckytin Fan Support</span>
                  <h2 class="font-display text-2xl sm:text-3xl font-bold text-secondary-900 tracking-tight">
                    Payment Recorded! 💳✨
                  </h2>
                  <p class="text-xs text-[#8c7456] font-semibold uppercase tracking-wider">
                    Thank you for your submission
                  </p>
                </div>

                <!-- Custom Stamp Look for Pending Review -->
                <div class="size-16 sm:size-20 border-2 border-dashed border-maloi-600 rounded-full flex flex-col items-center justify-center text-center p-1 rotate-12 bg-white/40 shadow-inner shrink-0">
                  <span class="font-type text-[8px] sm:text-[9px] uppercase tracking-wider text-maloi-600">LTFS</span>
                  <span class="font-display font-bold text-[10px] sm:text-[11px] text-maloi-600 leading-none my-0.5">PAYMENT</span>
                  <span class="font-type text-[7px] sm:text-[8px] text-maloi-600/80">RECEIVED</span>
                </div>
              </div>

              <!-- Ticket Divider Dot Line -->
              <div class="border-t-2 border-dashed border-[#ebdcb3] my-4 relative">
                <div class="absolute -left-8 -top-2 size-4 rounded-full bg-secondary-900 bg-blend-screen shadow-inner" />
                <div class="absolute -right-8 -top-2 size-4 rounded-full bg-secondary-900 bg-blend-screen shadow-inner" />
              </div>

              <!-- BOARDING INFO -->
              <div class="bg-secondary-50/50 border border-[#ebdcb3] p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left shadow-inner">
                <div class="space-y-1">
                  <span class="font-type text-[10px] uppercase tracking-wider text-[#8c7456]">Registration Pass ID</span>
                  <div class="font-type text-2xl font-bold tracking-widest text-secondary-900">
                    {{ form.registrationId.toUpperCase() }}
                  </div>
                </div>

                <div class="space-y-1 sm:text-right">
                  <span class="font-type text-[10px] uppercase tracking-wider text-[#8c7456] block">Payment Status</span>
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <span class="size-2 rounded-full bg-amber-500 animate-pulse" />
                    VERIFYING TRANSACTION
                  </span>
                </div>
              </div>

              <!-- CONFIRMATION SUMMARY -->
              <div class="space-y-3 text-sm text-secondary-900/80">
                <p class="leading-relaxed">
                  Hi <strong>{{ verifiedRegistrant.nickname }}</strong>, we have successfully received your payment details for Luckytin Fan Support's <strong>'Forgotten Island'</strong> Block Screening.
                </p>

                <!-- Box Details -->
                <div class="border border-[#ebdcb3]/60 bg-white/20 p-4 rounded-lg space-y-2 text-xs">
                  <div class="grid grid-cols-3 border-b border-[#ebdcb3]/30 pb-2">
                    <span class="font-semibold text-secondary-900/60 uppercase">Registrant</span>
                    <span class="col-span-2 text-secondary-900 font-medium">{{ verifiedRegistrant.fullName }}</span>
                  </div>
                  <div class="grid grid-cols-3 border-b border-[#ebdcb3]/30 pb-2">
                    <span class="font-semibold text-secondary-900/60 uppercase">Mode of Payment</span>
                    <span class="col-span-2 text-secondary-900 font-medium">{{ form.paymentMode.join(', ') }}</span>
                  </div>
                  <div class="grid grid-cols-3 pb-1">
                    <span class="font-semibold text-secondary-900/60 uppercase">Reference Number</span>
                    <span class="col-span-2 text-secondary-900 font-mono font-bold select-all bg-secondary-100/50 px-1 py-0.5 rounded">{{ form.referenceNo }}</span>
                  </div>
                </div>

                <div class="space-y-2 pt-2 text-xs text-[#8c7456] leading-relaxed border-l-2 border-maloi-600 pl-3">
                  <p>
                    ⚠️ Please note that your ticket purchase undergoes <strong>transaction verification</strong>.
                  </p>
                  <p>
                    📩 Once verified and approved, an official <strong>Seat Confirmation &amp; E-Ticket Email</strong> will be dispatched to your inbox.
                  </p>
                  <p>
                    📌 Please allow up to 24–48 hours for the verification process.
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
                <NuxtLink to="/blockscreening" class="font-type text-[10px] text-secondary-900/60 hover:text-secondary-900 underline uppercase tracking-wider">
                  Back to Registration
                </NuxtLink>
              </div>
            </div>

            <!-- Gingham beach towel strip footer -->
            <div class="h-4 bg-gingham-yellow-blue w-full border-t border-[#ebdcb3]/30" />
          </div>
        </div>

        <!-- PAYMENT SUBMISSION FORM -->
        <div v-else class="space-y-6">
          <div class="bg-paper text-secondary-950 p-6 sm:p-8 rounded-2xl shadow-2xl border border-[#f0e6d0] relative">
            <!-- Floating Palm Tree icon in corner -->
            <div class="absolute top-4 right-4 text-3xl opacity-20 pointer-events-none select-none">
              🌴
            </div>

            <div class="mb-6 space-y-2">
              <h2 class="font-display text-2xl sm:text-3xl text-secondary-900 tracking-tight">
                Payment Verification Submission
              </h2>
              <p class="text-xs sm:text-sm text-secondary-900/70 leading-relaxed font-sans">
                Please complete the form below to link your payment details to your Block Screening Registration. Refer to the kit inclusions below.
              </p>
            </div>

            <!-- KIT INCLUSIONS REFERENCE IMAGE -->
            <div class="mb-6 rounded-xl overflow-hidden border border-[#ebdcb3] shadow-md bg-white/40 p-2">
              <span class="font-type text-[10px] uppercase tracking-wider text-[#8c7456] mb-1.5 block pl-1">Reference Poster: Kit Inclusions</span>
              <img
                src="/images/blockscreening-payment-kit.jpg"
                alt="Kit Inclusions Reference Poster"
                class="w-full h-auto object-cover rounded-lg shadow-inner"
              >
            </div>

            <form class="space-y-6 text-sm" @submit.prevent="handleSubmit">
              <!-- Registration ID -->
              <div class="space-y-1">
                <label class="block font-semibold text-secondary-900">
                  Registration / Pass ID <span class="text-red-500">*</span>
                </label>
                <p class="text-xs text-[#8c7456] italic mb-1">
                  Enter the unique ID generated during registration (e.g., LTFI-A1B).
                </p>
                <UInput
                  v-model="form.registrationId"
                  placeholder="LTFI-XXX"
                  size="md"
                  class="w-full text-secondary-950 bg-white/50 border border-[#ebdcb3]/60 focus:border-secondary-500 rounded-lg uppercase"
                />
                <p v-if="errors.registrationId" class="text-xs text-error font-medium mt-1">
                  {{ errors.registrationId }}
                </p>
              </div>

              <!-- Mode of Payment Checkboxes -->
              <div class="space-y-2">
                <label class="block font-semibold text-secondary-900">
                  Mode of Payment <span class="text-red-500">*</span>
                </label>
                <p class="text-xs text-[#8c7456] italic mb-2">
                  Select the channel used for transaction payment (Select all that apply).
                </p>
                <div class="flex flex-col sm:flex-row gap-4 mt-1 pl-1">
                  <label class="flex items-center gap-2.5 cursor-pointer text-secondary-900 font-medium">
                    <input
                      v-model="form.paymentMode"
                      type="checkbox"
                      value="GCash"
                      class="size-4 rounded text-secondary-600 border-[#ebdcb3] focus:ring-secondary-500"
                    >
                    <span>GCash</span>
                  </label>
                  <label class="flex items-center gap-2.5 cursor-pointer text-secondary-900 font-medium">
                    <input
                      v-model="form.paymentMode"
                      type="checkbox"
                      value="Bank Transfer"
                      class="size-4 rounded text-secondary-600 border-[#ebdcb3] focus:ring-secondary-500"
                    >
                    <span>Bank Transfer</span>
                  </label>
                </div>
                <p v-if="errors.paymentMode" class="text-xs text-error font-medium mt-1">
                  {{ errors.paymentMode }}
                </p>
              </div>

              <!-- Reference Number -->
              <div class="space-y-1">
                <label class="block font-semibold text-secondary-900">
                  Reference No. of Payment Receipt <span class="text-red-500">*</span>
                </label>
                <p class="text-xs text-[#8c7456] italic mb-1">
                  Double-check this code from your GCash or Bank transaction receipt to prevent verification delays.
                </p>
                <UInput
                  v-model="form.referenceNo"
                  placeholder="Enter payment reference number"
                  size="md"
                  class="w-full text-secondary-950 bg-white/50 border border-[#ebdcb3]/60 focus:border-secondary-500 rounded-lg"
                />
                <p v-if="errors.referenceNo" class="text-xs text-error font-medium mt-1">
                  {{ errors.referenceNo }}
                </p>
              </div>

              <!-- ERROR FEEDBACK -->
              <Transition name="fade-slide">
                <div v-if="errorMessage" id="error-box" class="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl space-y-3 shadow-inner">
                  <div class="flex gap-2.5 items-start">
                    <UIcon name="ph:warning-circle-bold" class="size-5 shrink-0 mt-0.5 text-red-600" />
                    <div class="space-y-1 text-xs">
                      <strong class="font-bold text-sm text-red-950 block">
                        Submission Failed
                      </strong>
                      <p class="leading-relaxed text-red-800">
                        {{ errorMessage }}
                      </p>
                    </div>
                  </div>
                </div>
              </Transition>

              <!-- SUBMIT BUTTON -->
              <div class="pt-4 border-t border-[#ebdcb3] flex justify-between items-center gap-4">
                <NuxtLink to="/blockscreening" class="text-secondary-600 hover:text-secondary-900 text-xs font-semibold uppercase tracking-wider underline">
                  Back to Register
                </NuxtLink>

                <UButton
                  type="submit"
                  size="xl"
                  color="primary"
                  :disabled="isSubmitting"
                  class="rounded-full py-3 px-6 text-secondary-950 font-bold tracking-wide relative overflow-hidden flex items-center justify-center gap-2 group shadow-lg"
                >
                  <span class="relative z-10 flex items-center gap-2">
                    <UIcon :name="isSubmitting ? 'ph:circle-notch' : 'ph:credit-card-bold'" class="size-5" :class="isSubmitting && 'animate-spin'" />
                    {{ isSubmitting ? 'Verifying Details…' : 'Submit Payment' }}
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
input[type="checkbox"]:focus {
  outline: none;
}
</style>
