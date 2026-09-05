<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

useHead({
  title: 'Block Screening Registrations Console',
  meta: [
    { key: 'theme-color', name: 'theme-color', content: '#0f2038' },
  ],
  bodyAttrs: {
    class: 'overflow-x-hidden bg-secondary-950 text-primary-100 selection:bg-primary-300 selection:text-secondary-950',
  },
})

useSeoMeta({
  title: 'Registrations Console // LTFS Office',
  description: 'View and manage movie block screening registration records.',
})

interface Registration {
  id: string
  fullName: string
  nickname: string
  email: string
  mobile: string
  primaryPlatform: string
  primaryUsername: string
  otherPlatform: string
  otherUsername: string
  childRegistration: 'sponsor' | 'bring'
  minorName: string
  relationship: string
  paid: boolean
  paymentReference: string | null
  paymentMode: string | null
  paymentAmount?: number | null
  hasPaymentEntry?: boolean
  createdAt: string
}

const registrations = ref<Registration[]>([])
const isPending = ref(true)
const error = ref('')

// Custom password login state
const isAuthorized = ref(false)
const enteredPassword = ref('')
const loginError = ref('')
const isCheckingAuth = ref(true)

// Toast notifications
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')
let toastTimer: any = null

function showToast(message: string, type: 'success' | 'error' = 'success') {
  toastMessage.value = message
  toastType.value = type
  if (toastTimer)
    clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
  }, 4000)
}

async function fetchRegistrations() {
  isPending.value = true
  error.value = ''
  loginError.value = ''

  // Retrieve saved password from sessionStorage if in browser client
  const pwd = enteredPassword.value || (import.meta.client ? sessionStorage.getItem('blockscreening_admin_password') : null) || ''

  try {
    const data = await $fetch<{ registrations: Registration[] }>('/api/blockscreening/registrations', {
      headers: {
        'X-Admin-Password': pwd,
      },
    })
    registrations.value = data.registrations
    isAuthorized.value = true
    if (pwd && import.meta.client) {
      sessionStorage.setItem('blockscreening_admin_password', pwd)
    }
  }
  catch (err: any) {
    console.error('Failed to fetch registrations:', err)
    if (err.status === 401) {
      isAuthorized.value = false
      if (enteredPassword.value) {
        loginError.value = 'Incorrect admin passcode. Please try again.'
      }
    }
    else {
      error.value = err.data?.statusMessage || err.message || 'An unexpected error occurred while loading registrations.'
    }
  }
  finally {
    isPending.value = false
    isCheckingAuth.value = false
  }
}

function handlePasswordSubmit() {
  if (!enteredPassword.value.trim()) {
    loginError.value = 'Please enter the admin passcode.'
    return
  }
  fetchRegistrations()
}

onMounted(() => {
  fetchRegistrations()
})

// Search & Filter State
const searchQuery = ref('')
const platformFilter = ref('all')
const childFilter = ref('all')
const paymentFilter = ref('all')

// Filtered Registrations
const filteredRegistrations = computed(() => {
  return registrations.value.filter((r) => {
    // 1. Text Search matches multiple fields including payment details
    const query = searchQuery.value.toLowerCase().trim()
    const textMatch = !query || [
      r.id,
      r.fullName,
      r.nickname,
      r.email,
      r.mobile,
      r.primaryUsername,
      r.otherUsername,
      r.minorName,
      r.paymentReference || '',
      r.paymentMode || '',
    ].some(field => (field || '').toLowerCase().includes(query))

    // 2. Social Platform Filter
    const platformMatch = platformFilter.value === 'all'
      || r.primaryPlatform === platformFilter.value
      || r.otherPlatform === platformFilter.value

    // 3. Child Seat Filter
    const childMatch = childFilter.value === 'all'
      || (childFilter.value === 'sponsor' && (r.childRegistration === 'sponsor' || r.childRegistration === 'sponsor_one'))
      || (childFilter.value === 'sponsor_two' && (r.childRegistration === 'sponsor_two' || r.childRegistration === 'sponsor_2'))
      || (childFilter.value === 'bring' && r.childRegistration === 'bring')
      || r.childRegistration === childFilter.value

    // 4. Payment Status Filter
    const paymentMatch = paymentFilter.value === 'all'
      || (paymentFilter.value === 'paid' && r.paid)
      || (paymentFilter.value === 'unpaid' && !r.paid)

    return textMatch && platformMatch && childMatch && paymentMatch
  })
})

// Statistics Summaries
const totalSlots = computed(() => registrations.value.length)
const paidSlotsCount = computed(() => registrations.value.filter(r => r.paid).length)
const unpaidSlotsCount = computed(() => registrations.value.filter(r => !r.paid).length)
const sponsoredKidsCount = computed(() => {
  return registrations.value.reduce((total, r) => {
    if (r.childRegistration === 'sponsor_two' || r.childRegistration === 'sponsor_2') {
      return total + 2
    }
    if (r.childRegistration === 'sponsor' || r.childRegistration === 'sponsor_one') {
      return total + 1
    }
    return total
  }, 0)
})
const filteredSponsoredKidsCount = computed(() => {
  return filteredRegistrations.value.reduce((total, r) => {
    if (r.childRegistration === 'sponsor_two' || r.childRegistration === 'sponsor_2') {
      return total + 2
    }
    if (r.childRegistration === 'sponsor' || r.childRegistration === 'sponsor_one') {
      return total + 1
    }
    return total
  }, 0)
})
const collectedRevenue = computed(() => paidSlotsCount.value * 1500)

const filteredTotalSlots = computed(() => filteredRegistrations.value.length)
const filteredPaidCount = computed(() => filteredRegistrations.value.filter(r => r.paid).length)

// Payment Status Toggle Action
const isTogglingPayment = ref<string | null>(null)

async function togglePaymentStatus(registration: Registration) {
  isTogglingPayment.value = registration.id
  const targetStatus = !registration.paid
  const pwd = enteredPassword.value || (import.meta.client ? sessionStorage.getItem('blockscreening_admin_password') : null) || ''

  try {
    await $fetch('/api/blockscreening/paid', {
      method: 'POST',
      headers: {
        'X-Admin-Password': pwd,
      },
      body: {
        id: registration.id,
        paid: targetStatus,
      },
    })
    registration.paid = targetStatus
    showToast(`Updated payment status for ${registration.fullName} to: ${targetStatus ? 'PAID' : 'UNPAID'}`, 'success')
  }
  catch (err: any) {
    console.error('Failed to update payment status:', err)
    showToast(err.data?.statusMessage || 'Failed to update payment status.', 'error')
  }
  finally {
    isTogglingPayment.value = null
  }
}

// Seat Option Update Action
const isUpdatingSeatOption = ref<string | null>(null)

async function updateSeatOption(registration: Registration, newOption: string) {
  const previousOption = registration.childRegistration
  if (previousOption === newOption)
    return

  isUpdatingSeatOption.value = registration.id
  registration.childRegistration = newOption

  const pwd = enteredPassword.value || (import.meta.client ? sessionStorage.getItem('blockscreening_admin_password') : null) || ''

  try {
    await $fetch('/api/blockscreening/seat-option', {
      method: 'POST',
      headers: {
        'X-Admin-Password': pwd,
      },
      body: {
        id: registration.id,
        childRegistration: newOption,
      },
    })
    const labelMap: Record<string, string> = {
      sponsor: 'Sponsor 1 child 🐥',
      sponsor_two: 'Sponsor 2 children 🐥🐥',
      bring: 'Bring own child 🎒',
    }
    showToast(`Updated seat option for ${registration.fullName} to: ${labelMap[newOption] || newOption}`, 'success')
  }
  catch (err: any) {
    console.error('Failed to update seat option:', err)
    registration.childRegistration = previousOption
    showToast(err.data?.statusMessage || 'Failed to update seat option.', 'error')
  }
  finally {
    isUpdatingSeatOption.value = null
  }
}

// Email Dispatch Tracking
const sentPaymentEmails = ref<Set<string>>(new Set())
const sentConfirmations = ref<Set<string>>(new Set())

// Send Email Action
const sendingEmailId = ref<string | null>(null)

async function sendPaymentEmail(registration: Registration) {
  if (registration.paid) {
    showToast('Payment instructions email is blocked because this registrant has already paid.', 'error')
    return
  }

  // eslint-disable-next-line no-alert
  const confirmSend = confirm(`Send payment instructions email to ${registration.fullName} (${registration.email})?`)
  if (!confirmSend)
    return

  sendingEmailId.value = registration.id
  const pwd = enteredPassword.value || (import.meta.client ? sessionStorage.getItem('blockscreening_admin_password') : null) || ''

  try {
    await $fetch('/api/blockscreening/send-payment-email', {
      method: 'POST',
      headers: {
        'X-Admin-Password': pwd,
      },
      body: {
        id: registration.id,
        email: registration.email,
        nickname: registration.nickname,
        fullName: registration.fullName,
      },
    })
    sentPaymentEmails.value.add(registration.id)
    showToast(`Payment instructions email dispatched to ${registration.email}!`, 'success')
  }
  catch (err: any) {
    console.error('Failed to send email:', err)
    showToast(err.data?.statusMessage || 'Failed to send email to attendee.', 'error')
  }
  finally {
    sendingEmailId.value = null
  }
}

// Send Payment Confirmation Email Action
const sendingConfirmationId = ref<string | null>(null)

async function sendConfirmationEmail(registration: Registration) {
  if (!registration.paid) {
    showToast('Confirmation pass email is blocked because this registrant is not marked as PAID.', 'error')
    return
  }

  // eslint-disable-next-line no-alert
  const confirmSend = confirm(`Send verified payment confirmation & admission pass to ${registration.fullName} (${registration.email})?`)
  if (!confirmSend)
    return

  sendingConfirmationId.value = registration.id
  const pwd = enteredPassword.value || (import.meta.client ? sessionStorage.getItem('blockscreening_admin_password') : null) || ''

  try {
    await $fetch('/api/blockscreening/send-confirmation-email', {
      method: 'POST',
      headers: {
        'X-Admin-Password': pwd,
      },
      body: {
        id: registration.id,
        email: registration.email,
        fullName: registration.fullName,
        nickname: registration.nickname,
        childRegistration: registration.childRegistration,
        minorName: registration.minorName,
        relationship: registration.relationship,
      },
    })
    sentConfirmations.value.add(registration.id)
    showToast(`Payment confirmation pass dispatched to ${registration.email}!`, 'success')
  }
  catch (err: any) {
    console.error('Failed to send confirmation email:', err)
    showToast(err.data?.statusMessage || 'Failed to send confirmation email.', 'error')
  }
  finally {
    sendingConfirmationId.value = null
  }
}

// Clipboard Utility
const copiedId = ref<string | null>(null)
function copyToClipboard(uniqueId: string, text: string) {
  navigator.clipboard.writeText(text).then(() => {
    copiedId.value = uniqueId
    setTimeout(() => {
      copiedId.value = null
    }, 2000)
  })
}

// Export CSV Functionality
function exportToCSV() {
  const headers = [
    'Registration ID',
    'Full Name',
    'Nickname',
    'Email Address',
    'Mobile Number',
    'Payment Status',
    'Payment Mode',
    'Payment Reference',
    'Primary Platform',
    'Primary Username',
    'Other Platform',
    'Other Username',
    'Child Registration Type',
    'Minor Name (If Bring Own)',
    'Relationship to Minor',
    'Submitted At',
  ]

  const rows = filteredRegistrations.value.map(r => [
    r.id,
    r.fullName,
    r.nickname,
    r.email,
    r.mobile,
    r.paid ? 'PAID' : 'PENDING PAYMENT',
    r.paymentMode || 'None',
    r.paymentReference || 'None',
    r.primaryPlatform,
    r.primaryUsername,
    r.otherPlatform || 'None',
    r.childRegistration === 'sponsor_two'
      ? 'Sponsoring two charity children'
      : (r.childRegistration === 'sponsor' || r.childRegistration === 'sponsor_one')
          ? 'Sponsoring a charity child'
          : 'Bringing own child',
    r.minorName || 'N/A',
    r.relationship || 'N/A',
    new Date(r.createdAt).toLocaleString(),
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(',')),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `LTFS_Block_Screening_Registrations_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="min-h-dvh flex flex-col justify-between bg-secondary-900 bg-[url('/images/textures/06.jpg')] bg-blend-screen bg-cover bg-center overflow-x-hidden relative">
    <!-- Breeze palm backdrop decorations -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden select-none z-0 opacity-10">
      <div class="absolute top-12 -left-12 text-9xl">
        🌴
      </div>
      <div class="absolute top-1/3 -right-16 text-9xl">
        🌴
      </div>
      <div class="absolute bottom-12 left-10 text-9xl">
        🌊
      </div>
    </div>

    <!-- Floating Feedback Toast -->
    <div
      v-if="toastMessage"
      class="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium transition-all animate-bounce"
      :class="toastType === 'success' ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40' : 'bg-rose-950/90 text-rose-200 border-rose-500/40'"
    >
      <UIcon :name="toastType === 'success' ? 'ph:check-circle-bold' : 'ph:warning-circle-bold'" class="size-5 shrink-0" />
      <span>{{ toastMessage }}</span>
    </div>

    <!-- 1. CHECKING AUTHENTICATION LOADER -->
    <div v-if="isCheckingAuth" class="relative z-10 w-full flex-1 flex flex-col items-center justify-center py-20 text-primary-200/50 gap-3">
      <UIcon name="ph:circle-notch" class="size-8 animate-spin text-primary-300" />
      <p class="text-sm font-medium">
        Verifying console access...
      </p>
    </div>

    <!-- 2. LOGIN PASSCODE INTERFACE -->
    <div v-else-if="!isAuthorized" class="relative z-10 w-full max-w-md mx-auto px-4 py-16 flex-1 flex flex-col justify-center">
      <div class="rip bg-paper text-secondary-950 p-6 sm:p-8 rounded-2xl shadow-2xl border border-[#f0e6d0] relative">
        <div class="absolute top-4 right-4 text-3xl opacity-25 select-none pointer-events-none">
          🔐
        </div>

        <header class="text-center mb-6">
          <span class="font-mono text-[10px] uppercase tracking-widest text-[#8c7456] block">Luckytin Fan Support</span>
          <h2 class="font-display text-2xl font-bold text-secondary-900 tracking-tight mt-1">
            Console Passcode
          </h2>
          <p class="text-xs text-secondary-900/60 mt-1">
            Please enter the admin security password to unlock the database.
          </p>
        </header>

        <form class="space-y-4" @submit.prevent="handlePasswordSubmit">
          <div class="space-y-1">
            <label class="block font-semibold text-secondary-900 text-xs uppercase tracking-wider">
              Passcode
            </label>
            <UInput
              v-model="enteredPassword"
              type="password"
              placeholder="••••••••"
              size="md"
              class="w-full text-secondary-950 bg-white border border-[#ebdcb3]/60 focus:border-secondary-500 rounded-lg text-sm"
              autofocus
            />
            <p v-if="loginError" class="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
              <UIcon name="ph:warning-circle" class="size-4 shrink-0" />
              <span>{{ loginError }}</span>
            </p>
          </div>

          <UButton
            type="submit"
            color="primary"
            class="w-full text-secondary-950 font-bold"
            size="md"
            icon="ph:lock-open"
            :loading="isPending"
          >
            Unlock Console
          </UButton>
        </form>

        <div class="mt-6 pt-4 border-t border-[#ebdcb3]/40 flex justify-between items-center text-[10px] text-secondary-900/40 uppercase font-mono">
          <NuxtLink to="/blockscreening" class="hover:text-secondary-700 transition-colors">
            ← Registration Page
          </NuxtLink>
          <span>Forgotten Island 2026</span>
        </div>
      </div>
    </div>

    <!-- 3. AUTHORIZED CONSOLE -->
    <div v-else class="relative z-10 w-full max-w-7xl mx-auto px-4 py-8 sm:py-12 flex-1 flex flex-col gap-6">
      <!-- HEADER PORTION -->
      <header class="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-primary-100/10 pb-6">
        <div class="text-center sm:text-left">
          <div class="flex items-center justify-center sm:justify-start gap-2 text-primary-300 font-mono text-xs uppercase tracking-[0.25em]">
            <span>Back Office Portal</span>
            <span class="text-primary-100/30">•</span>
            <span>Forgotten Island</span>
          </div>
          <h1 class="mt-1 text-3xl sm:text-4xl font-display text-primary-100 tracking-tighter">
            Block Screening Admin
          </h1>
          <p class="text-xs sm:text-sm text-primary-200/60 font-sans mt-0.5">
            Real-time registration & payment tracking database for Luckytin Fan Support.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <NuxtLink to="/blockscreening">
            <UButton variant="outline" size="md" icon="ph:arrow-left-bold" class="rounded-lg">
              Registration Form
            </UButton>
          </NuxtLink>
          <NuxtLink to="/office">
            <UButton
              color="secondary"
              variant="subtle"
              size="md"
              icon="ph:star-four-fill"
              class="rounded-lg"
            >
              LTFS Office Home
            </UButton>
          </NuxtLink>
        </div>
      </header>

      <!-- STATISTICS SUMMARY GRID -->
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Card 1: Total Registered -->
        <div class="bg-secondary-950/60 backdrop-blur-md border border-primary-100/10 p-5 rounded-2xl flex items-center gap-4 shadow-lg">
          <div class="size-12 rounded-xl bg-primary-100/10 flex items-center justify-center text-2xl text-primary-300">
            🎟️
          </div>
          <div class="space-y-0.5">
            <p class="text-xs uppercase tracking-wider text-primary-200/50 font-medium">
              Total Registered
            </p>
            <div class="flex items-baseline gap-1.5">
              <span class="text-2xl font-bold font-mono text-primary-100">{{ totalSlots }}</span>
              <span v-if="searchQuery || platformFilter !== 'all' || childFilter !== 'all' || paymentFilter !== 'all'" class="text-xs text-primary-300/80">
                ({{ filteredTotalSlots }} filtered)
              </span>
            </div>
          </div>
        </div>

        <!-- Card 2: Paid Slots & Collected Revenue -->
        <div class="bg-secondary-950/60 backdrop-blur-md border border-emerald-500/20 p-5 rounded-2xl flex items-center gap-4 shadow-lg">
          <div class="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-2xl text-emerald-400">
            💳
          </div>
          <div class="space-y-0.5">
            <p class="text-xs uppercase tracking-wider text-emerald-300/70 font-medium">
              Paid Slots (Collected)
            </p>
            <div class="flex items-baseline gap-1.5">
              <span class="text-2xl font-bold font-mono text-emerald-300">{{ paidSlotsCount }}</span>
              <span
                v-if="searchQuery || platformFilter !== 'all' || childFilter !== 'all' || paymentFilter !== 'all'"
                class="text-xs text-emerald-300/80"
              >
                ({{ filteredPaidCount }} filtered)
              </span>
              <span class="text-xs text-emerald-400/80 font-mono">
                (₱{{ collectedRevenue.toLocaleString() }})
              </span>
            </div>
          </div>
        </div>

        <!-- Card 3: Pending Payments -->
        <div class="bg-secondary-950/60 backdrop-blur-md border border-rose-500/20 p-5 rounded-2xl flex items-center gap-4 shadow-lg">
          <div class="size-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-2xl text-rose-400">
            ⏳
          </div>
          <div class="space-y-0.5">
            <p class="text-xs uppercase tracking-wider text-rose-300/70 font-medium">
              Pending Payment
            </p>
            <div class="flex items-baseline gap-1.5">
              <span class="text-2xl font-bold font-mono text-rose-300">{{ unpaidSlotsCount }}</span>
              <span class="text-xs text-rose-300/60">
                attendees
              </span>
            </div>
          </div>
        </div>

        <!-- Card 4: Sponsoring Charity Kids -->
        <div class="bg-secondary-950/60 backdrop-blur-md border border-primary-100/10 p-5 rounded-2xl flex items-center gap-4 shadow-lg">
          <div class="size-12 rounded-xl bg-primary-100/10 flex items-center justify-center text-2xl text-primary-300">
            🐥
          </div>
          <div class="space-y-0.5">
            <p class="text-xs uppercase tracking-wider text-primary-200/50 font-medium">
              Bahay Tuluyan Kids
            </p>
            <div class="flex items-baseline gap-1.5">
              <span class="text-2xl font-bold font-mono text-primary-100">{{ sponsoredKidsCount }}</span>
              <span
                v-if="searchQuery || platformFilter !== 'all' || childFilter !== 'all' || paymentFilter !== 'all'"
                class="text-xs text-primary-300/80"
              >
                ({{ filteredSponsoredKidsCount }} filtered)
              </span>
              <span class="text-xs text-primary-300/70">
                sponsored
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- CONTROL FILTERS BAR -->
      <section class="bg-secondary-950/50 backdrop-blur-md border border-primary-100/10 p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between">
        <!-- Interactive search/inputs left side -->
        <div class="w-full flex flex-col sm:flex-row flex-wrap gap-3 items-center flex-1">
          <!-- Text Search -->
          <div class="relative w-full sm:max-w-xs">
            <UInput
              v-model="searchQuery"
              placeholder="Search name, email, ref, handle..."
              size="md"
              icon="ph:magnifying-glass"
              class="w-full text-secondary-950 bg-white/5 border border-primary-100/10 rounded-lg text-sm"
            />
          </div>

          <!-- Payment Filter -->
          <div class="w-full sm:w-auto flex items-center gap-2">
            <span class="text-xs text-primary-200/50 shrink-0 font-medium uppercase tracking-wider">Payment:</span>
            <select
              v-model="paymentFilter"
              class="bg-secondary-950 text-primary-100 border border-primary-100/15 rounded-lg py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary-300"
            >
              <option value="all">
                All Statuses
              </option>
              <option value="paid">
                Paid Only 💳
              </option>
              <option value="unpaid">
                Pending Payment ⏳
              </option>
            </select>
          </div>

          <!-- Platform Filter -->
          <div class="w-full sm:w-auto flex items-center gap-2">
            <span class="text-xs text-primary-200/50 shrink-0 font-medium uppercase tracking-wider">Platform:</span>
            <select
              v-model="platformFilter"
              class="bg-secondary-950 text-primary-100 border border-primary-100/15 rounded-lg py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary-300"
            >
              <option value="all">
                All Platforms
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

          <!-- Child Option Filter -->
          <div class="w-full sm:w-auto flex items-center gap-2">
            <span class="text-xs text-primary-200/50 shrink-0 font-medium uppercase tracking-wider">Seats:</span>
            <select
              v-model="childFilter"
              class="bg-secondary-950 text-primary-100 border border-primary-100/15 rounded-lg py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary-300"
            >
              <option value="all">
                All Inclusions
              </option>
              <option value="sponsor">
                Sponsor 1 Child 🐥
              </option>
              <option value="sponsor_two">
                Sponsor 2 Children 🐥🐥
              </option>
              <option value="bring">
                Bring Own Child 🎒
              </option>
            </select>
          </div>
        </div>

        <!-- Export CSV button on the right -->
        <div class="w-full md:w-auto flex justify-end gap-2 shrink-0">
          <UButton
            v-if="filteredRegistrations.length"
            size="md"
            icon="ph:download-simple"
            color="primary"
            class="w-full md:w-auto text-secondary-950"
            @click="exportToCSV"
          >
            Export CSV
          </UButton>
          <UButton
            size="md"
            icon="ph:arrow-clockwise"
            variant="outline"
            class="w-full md:w-auto"
            :loading="isPending"
            @click="fetchRegistrations"
          >
            Refresh
          </UButton>
        </div>
      </section>

      <!-- REGISTRATIONS CONTENT AREA -->
      <section class="flex-1 flex flex-col min-h-100">
        <!-- Dynamic loading overlay -->
        <div v-if="isPending" class="flex-1 flex flex-col items-center justify-center py-20 text-primary-200/50 gap-3">
          <UIcon name="ph:circle-notch" class="size-8 animate-spin text-primary-300" />
          <p class="text-sm">
            Retrieving registrations list from Supabase...
          </p>
        </div>

        <!-- Database Fetching Error -->
        <div v-else-if="error" class="flex-1 flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto gap-4">
          <div class="size-16 rounded-full bg-red-500/10 flex items-center justify-center text-3xl">
            ⚠️
          </div>
          <div class="space-y-1">
            <h3 class="font-bold text-lg text-primary-100">
              Database Connection Failed
            </h3>
            <p class="text-xs text-primary-200/60 leading-relaxed">
              {{ error }}
            </p>
          </div>
          <UButton size="sm" @click="fetchRegistrations">
            Try Again
          </UButton>
        </div>

        <!-- Empty Query / Matches state -->
        <div v-else-if="!registrations.length" class="flex-1 flex flex-col items-center justify-center py-20 text-primary-200/50 text-center gap-3">
          <div class="text-5xl">
            🏝️
          </div>
          <p class="text-sm font-semibold">
            No Registrations in Database yet
          </p>
          <p class="text-xs text-primary-200/40">
            Submissions from the registration form will appear here in real-time.
          </p>
        </div>

        <!-- No search matches -->
        <div v-else-if="!filteredRegistrations.length" class="flex-1 flex flex-col items-center justify-center py-20 text-primary-200/50 text-center gap-3">
          <UIcon name="ph:magnifying-glass" class="size-10 text-primary-200/30" />
          <p class="text-sm font-semibold">
            No registrations match your search
          </p>
          <p class="text-xs text-primary-200/40">
            Try adjusting your filters or query string.
          </p>
        </div>

        <!-- DATA FOUND -->
        <div v-else class="space-y-4">
          <!-- DESKTOP TABULAR VIEW -->
          <div class="hidden lg:block overflow-hidden border border-primary-100/10 rounded-2xl bg-secondary-950/30 backdrop-blur-md">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="bg-secondary-950 text-primary-200/60 uppercase tracking-wider font-mono border-b border-primary-100/10">
                    <th class="py-4 px-4 font-semibold">
                      ID
                    </th>
                    <th class="py-4 px-4 font-semibold">
                      Attendee Info
                    </th>
                    <th class="py-4 px-4 font-semibold">
                      Contact Details
                    </th>
                    <th class="py-4 px-4 font-semibold">
                      Social Verification
                    </th>
                    <th class="py-4 px-4 font-semibold">
                      Seat Option
                    </th>
                    <th class="py-4 px-4 font-semibold">
                      Payment Status
                    </th>
                    <th class="py-4 px-4 font-semibold">
                      Payment Mode
                    </th>
                    <th class="py-4 px-4 font-semibold">
                      Payment Ref
                    </th>
                    <th class="py-4 px-4 font-semibold">
                      Registered At
                    </th>
                    <th class="py-4 px-4 font-semibold text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-primary-100/10 text-primary-100/95 font-sans">
                  <tr v-for="r in filteredRegistrations" :key="r.id" class="hover:bg-primary-100/5 transition-colors">
                    <!-- ID -->
                    <td class="py-4 px-4 font-mono font-bold whitespace-nowrap">
                      <div class="flex items-center gap-1.5">
                        <span class="text-primary-300">{{ r.id }}</span>
                        <button
                          class="hover:text-primary-300 transition-colors p-0.5 text-primary-100/30"
                          title="Copy Pass ID"
                          @click="copyToClipboard(r.id, r.id)"
                        >
                          <UIcon :name="copiedId === r.id ? 'ph:check-bold' : 'ph:copy'" class="size-3.5" />
                        </button>
                      </div>
                    </td>

                    <!-- Name / Nickname -->
                    <td class="py-4 px-4">
                      <div class="font-medium text-primary-50 text-sm leading-tight">
                        {{ r.fullName }}
                      </div>
                      <div class="text-[10px] text-primary-200/50 mt-0.5">
                        As: "{{ r.nickname }}"
                      </div>
                    </td>

                    <!-- Contact Details -->
                    <td class="py-4 px-4 whitespace-nowrap">
                      <div class="flex items-center gap-1">
                        <span class="text-primary-200/80">{{ r.email }}</span>
                        <button
                          class="hover:text-primary-300 transition-colors p-0.5 text-primary-100/30"
                          title="Copy Email"
                          @click="copyToClipboard(`${r.id}-email`, r.email)"
                        >
                          <UIcon :name="copiedId === `${r.id}-email` ? 'ph:check-bold' : 'ph:copy'" class="size-3" />
                        </button>
                      </div>
                      <div class="flex items-center gap-1 mt-0.5 text-[10px] text-primary-200/50">
                        <span>{{ r.mobile }}</span>
                        <button
                          class="hover:text-primary-300 transition-colors p-0.5 text-primary-100/20"
                          title="Copy Mobile"
                          @click="copyToClipboard(`${r.id}-mobile`, r.mobile)"
                        >
                          <UIcon :name="copiedId === `${r.id}-mobile` ? 'ph:check-bold' : 'ph:copy'" class="size-2.5" />
                        </button>
                      </div>
                    </td>

                    <!-- Social accounts -->
                    <td class="py-4 px-4 max-w-50 truncate">
                      <div class="flex items-center gap-1">
                        <span class="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary-100/10 text-primary-300">{{ r.primaryPlatform }}</span>
                        <span class="font-medium truncate text-primary-100" :title="r.primaryUsername">{{ r.primaryUsername }}</span>
                      </div>
                      <div v-if="r.otherPlatform" class="flex items-center gap-1 mt-1 text-[10px] text-primary-200/50">
                        <span class="capitalize">{{ r.otherPlatform }}:</span>
                        <span class="truncate" :title="r.otherUsername">{{ r.otherUsername }}</span>
                      </div>
                    </td>

                    <!-- Child / Seat Option Selection Dropdown -->
                    <td class="py-4 px-4 whitespace-nowrap">
                      <div class="relative inline-block">
                        <select
                          :value="r.childRegistration"
                          :disabled="isUpdatingSeatOption === r.id"
                          class="appearance-none font-sans text-xs font-semibold rounded-lg pl-2.5 pr-7 py-1.5 border transition-all cursor-pointer focus:outline-none focus:ring-1"
                          :class="[
                            (r.childRegistration === 'sponsor_two' || r.childRegistration === 'sponsor_2')
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 focus:ring-amber-400'
                              : (r.childRegistration === 'sponsor' || r.childRegistration === 'sponsor_one')
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 focus:ring-emerald-400'
                                : 'bg-blue-500/15 text-blue-300 border-blue-500/30 focus:ring-blue-400',
                            isUpdatingSeatOption === r.id && 'opacity-50 cursor-wait',
                          ]"
                          @change="updateSeatOption(r, ($event.target as HTMLSelectElement).value)"
                        >
                          <option value="sponsor" class="bg-secondary-950 text-primary-100">
                            🐥 Sponsor 1 child
                          </option>
                          <option value="sponsor_two" class="bg-secondary-950 text-primary-100">
                            🐥🐥 Sponsor 2 children
                          </option>
                          <option value="bring" class="bg-secondary-950 text-primary-100">
                            🎒 Bring own child
                          </option>
                        </select>
                        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-primary-200/50">
                          <UIcon v-if="isUpdatingSeatOption === r.id" name="ph:circle-notch" class="size-3 animate-spin text-primary-300" />
                          <UIcon v-else name="ph:caret-down-bold" class="size-2.5" />
                        </div>
                      </div>
                      <div v-if="r.childRegistration === 'bring' && r.minorName" class="text-[10px] text-primary-200/50 mt-1 truncate max-w-[140px]" :title="`${r.minorName} (${r.relationship || 'Child'})`">
                        Child: {{ r.minorName }}
                      </div>
                    </td>

                    <!-- Payment Status (Toggleable) -->
                    <td class="py-4 px-4 whitespace-nowrap">
                      <button
                        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-all hover:scale-105 active:scale-95 cursor-pointer"
                        :class="r.paid ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border-rose-500/30'"
                        :disabled="isTogglingPayment === r.id"
                        title="Click to toggle Payment Status"
                        @click="togglePaymentStatus(r)"
                      >
                        <UIcon v-if="isTogglingPayment === r.id" name="ph:circle-notch" class="size-3 animate-spin" />
                        <span v-else class="size-1.5 rounded-full" :class="r.paid ? 'bg-emerald-400' : 'bg-rose-400 animate-pulse'" />
                        <span>{{ r.paid ? 'PAID 💳' : 'UNPAID ⏳' }}</span>
                      </button>
                    </td>

                    <!-- Payment Mode -->
                    <td class="py-4 px-4 whitespace-nowrap">
                      <span
                        v-if="r.paymentMode"
                        class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-primary-100/10 text-primary-200 border border-primary-100/15"
                      >
                        <UIcon name="ph:credit-card" class="size-3 text-primary-300" />
                        {{ r.paymentMode }}
                      </span>
                      <span v-else class="text-primary-100/30 font-mono text-xs italic">
                        None
                      </span>
                    </td>

                    <!-- Payment Reference -->
                    <td class="py-4 px-4 whitespace-nowrap">
                      <div v-if="r.paymentReference" class="flex items-center gap-1.5 font-mono text-xs">
                        <span class="text-primary-100 bg-secondary-900/80 px-2 py-0.5 rounded border border-primary-100/10">{{ r.paymentReference }}</span>
                        <button
                          class="hover:text-primary-300 transition-colors p-0.5 text-primary-100/30"
                          title="Copy Reference"
                          @click="copyToClipboard(`${r.id}-ref`, r.paymentReference)"
                        >
                          <UIcon :name="copiedId === `${r.id}-ref` ? 'ph:check-bold' : 'ph:copy'" class="size-3" />
                        </button>
                      </div>
                      <span v-else class="text-primary-100/30 font-mono text-xs italic">
                        None
                      </span>
                    </td>

                    <!-- Created At -->
                    <td class="py-4 px-4 whitespace-nowrap text-primary-200/60 font-mono">
                      {{ formatDate(r.createdAt) }}
                    </td>

                    <!-- Actions -->
                    <td class="py-4 px-4 text-right whitespace-nowrap">
                      <div class="flex items-center justify-end gap-1.5">
                        <UButton
                          size="xs"
                          variant="subtle"
                          color="primary"
                          icon="ph:paper-plane-tilt"
                          :disabled="r.paid || sendingEmailId === r.id"
                          :loading="sendingEmailId === r.id"
                          :class="r.paid && 'opacity-25 cursor-not-allowed pointer-events-none'"
                          :title="r.paid ? 'Payment already completed (Payment link blocked)' : (sentPaymentEmails.has(r.id) ? 'Payment link sent' : 'Send payment link instructions email')"
                          @click="sendPaymentEmail(r)"
                        >
                          {{ sentPaymentEmails.has(r.id) ? 'Sent ✓' : 'Payment' }}
                        </UButton>
                        <UButton
                          size="xs"
                          variant="subtle"
                          color="emerald"
                          icon="ph:seal-check-fill"
                          :disabled="!r.paid || sendingConfirmationId === r.id || sentConfirmations.has(r.id)"
                          :loading="sendingConfirmationId === r.id"
                          :class="(!r.paid || sentConfirmations.has(r.id)) && 'opacity-25 cursor-not-allowed pointer-events-none'"
                          :title="!r.paid ? 'Mark as PAID to unlock confirmation email' : (sentConfirmations.has(r.id) ? 'Confirmation pass already sent' : 'Send verified payment and event admission ticket email')"
                          @click="sendConfirmationEmail(r)"
                        >
                          {{ sentConfirmations.has(r.id) ? 'Sent ✓' : 'Confirm' }}
                        </UButton>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- MOBILE / RESPONSIVE CARD VIEW -->
          <div class="lg:hidden space-y-4">
            <div
              v-for="r in filteredRegistrations"
              :key="r.id"
              class="rip bg-paper text-secondary-950 shadow-lg border border-[#f0e6d0] rounded-xl overflow-hidden"
            >
              <!-- Ticket small striped accent top -->
              <div class="h-2 bg-gingham-yellow-blue w-full" />

              <div class="p-4 space-y-4">
                <!-- Ticket Row 1: ID & Date -->
                <div class="flex items-center justify-between gap-2 border-b border-[#ebdcb3]/60 pb-2">
                  <div class="flex items-center gap-1.5">
                    <span class="font-mono font-bold text-sm tracking-wide text-secondary-900">{{ r.id }}</span>
                    <button
                      class="text-secondary-400 hover:text-secondary-600 transition-colors p-0.5"
                      @click="copyToClipboard(`${r.id}-mob`, r.id)"
                    >
                      <UIcon :name="copiedId === `${r.id}-mob` ? 'ph:check-bold' : 'ph:copy'" class="size-4" />
                    </button>
                  </div>
                  <span class="text-[10px] text-secondary-500 font-mono">{{ formatDate(r.createdAt) }}</span>
                </div>

                <!-- Row 2: Registrant and Contact Details -->
                <div class="space-y-1">
                  <h4 class="font-display font-bold text-base text-secondary-900 leading-tight">
                    {{ r.fullName }}
                    <span class="text-xs font-normal text-secondary-500 font-sans">({{ r.nickname }})</span>
                  </h4>
                  <div class="text-xs text-secondary-700 space-y-0.5">
                    <p class="flex items-center gap-1">
                      <UIcon name="ph:envelope-simple" />
                      <span>{{ r.email }}</span>
                    </p>
                    <p class="flex items-center gap-1">
                      <UIcon name="ph:phone" />
                      <span>{{ r.mobile }}</span>
                    </p>
                  </div>
                </div>

                <!-- Row 3: Social handle & Seats -->
                <div class="grid grid-cols-2 gap-2 bg-[#ebdcb3]/20 border border-[#ebdcb3]/40 p-2.5 rounded-lg text-xs">
                  <div>
                    <span class="font-bold text-[9px] uppercase tracking-wider text-secondary-500 block mb-1">Social Handle</span>
                    <span class="font-medium font-mono text-secondary-800 bg-[#ebdcb3]/30 px-1 py-0.5 rounded text-[11px]">
                      {{ r.primaryPlatform }}: {{ r.primaryUsername }}
                    </span>
                    <span v-if="r.otherPlatform" class="block text-[10px] text-secondary-500 mt-1 truncate">
                      {{ r.otherPlatform }}: {{ r.otherUsername }}
                    </span>
                  </div>

                  <div>
                    <span class="font-bold text-[9px] uppercase tracking-wider text-secondary-500 block mb-1">Pass Inclusion</span>
                    <div class="relative inline-block w-full">
                      <select
                        :value="r.childRegistration"
                        :disabled="isUpdatingSeatOption === r.id"
                        class="w-full appearance-none font-sans text-xs font-bold rounded-lg pl-2 pr-6 py-1 border transition-all cursor-pointer focus:outline-none"
                        :class="[
                          (r.childRegistration === 'sponsor_two' || r.childRegistration === 'sponsor_2')
                            ? 'bg-amber-50 text-amber-900 border-amber-300'
                            : (r.childRegistration === 'sponsor' || r.childRegistration === 'sponsor_one')
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                              : 'bg-blue-50 text-blue-900 border-blue-300',
                          isUpdatingSeatOption === r.id && 'opacity-50 cursor-wait',
                        ]"
                        @change="updateSeatOption(r, ($event.target as HTMLSelectElement).value)"
                      >
                        <option value="sponsor">
                          🐥 Sponsor 1 child
                        </option>
                        <option value="sponsor_two">
                          🐥🐥 Sponsor 2 children
                        </option>
                        <option value="bring">
                          🎒 Bring own child
                        </option>
                      </select>
                      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-secondary-600">
                        <UIcon v-if="isUpdatingSeatOption === r.id" name="ph:circle-notch" class="size-3 animate-spin text-secondary-700" />
                        <UIcon v-else name="ph:caret-down-bold" class="size-2.5" />
                      </div>
                    </div>
                    <span v-if="r.childRegistration === 'bring' && r.minorName" class="block text-[10px] text-secondary-600 font-medium mt-1 truncate" :title="r.minorName">
                      {{ r.minorName }} ({{ r.relationship || 'Child' }})
                    </span>
                  </div>
                </div>

                <!-- Row 4: Payment Submission Details -->
                <div class="bg-[#ebdcb3]/20 border border-[#ebdcb3]/40 p-2.5 rounded-lg text-xs space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-[9px] uppercase tracking-wider text-secondary-500">Payment Submission</span>
                    <span v-if="r.paymentMode" class="font-mono text-[10px] font-bold bg-[#ebdcb3]/40 px-1.5 py-0.5 rounded text-secondary-900">
                      {{ r.paymentMode }}
                    </span>
                    <span v-else class="text-[10px] text-secondary-400 italic">None</span>
                  </div>

                  <div class="flex items-center justify-between pt-1">
                    <span class="text-[10px] text-secondary-600">Reference:</span>
                    <div v-if="r.paymentReference" class="flex items-center gap-1 font-mono text-xs font-semibold text-secondary-900">
                      <span>{{ r.paymentReference }}</span>
                      <button
                        class="text-secondary-400 hover:text-secondary-600 p-0.5"
                        @click="copyToClipboard(`${r.id}-mob-ref`, r.paymentReference)"
                      >
                        <UIcon :name="copiedId === `${r.id}-mob-ref` ? 'ph:check-bold' : 'ph:copy'" class="size-3" />
                      </button>
                    </div>
                    <span v-else class="text-[10px] text-secondary-400 italic">None</span>
                  </div>
                </div>

                <!-- Row 5: Payment Toggle and Send Email Buttons -->
                <div class="pt-2 border-t border-[#ebdcb3]/60 flex flex-wrap items-center justify-between gap-2">
                  <button
                    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer"
                    :class="r.paid ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-rose-50 text-rose-800 border-rose-300'"
                    :disabled="isTogglingPayment === r.id"
                    @click="togglePaymentStatus(r)"
                  >
                    <UIcon v-if="isTogglingPayment === r.id" name="ph:circle-notch" class="size-3 animate-spin" />
                    <span v-else class="size-2 rounded-full" :class="r.paid ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'" />
                    <span>{{ r.paid ? 'PAID 💳' : 'UNPAID ⏳' }}</span>
                  </button>

                  <div class="flex items-center gap-1.5">
                    <UButton
                      size="xs"
                      color="primary"
                      icon="ph:paper-plane-tilt"
                      class="text-secondary-950 font-bold"
                      :disabled="r.paid || sendingEmailId === r.id"
                      :loading="sendingEmailId === r.id"
                      :class="r.paid && 'opacity-30 cursor-not-allowed pointer-events-none'"
                      :title="r.paid ? 'Payment already completed (Payment link blocked)' : 'Send Payment Link Email'"
                      @click="sendPaymentEmail(r)"
                    >
                      {{ sentPaymentEmails.has(r.id) ? 'Sent ✓' : 'Payment' }}
                    </UButton>
                    <UButton
                      size="xs"
                      color="emerald"
                      icon="ph:seal-check-fill"
                      class="font-bold text-white"
                      :disabled="!r.paid || sendingConfirmationId === r.id || sentConfirmations.has(r.id)"
                      :loading="sendingConfirmationId === r.id"
                      :class="(!r.paid || sentConfirmations.has(r.id)) && 'opacity-30 cursor-not-allowed pointer-events-none'"
                      :title="!r.paid ? 'Mark as PAID to unlock confirmation pass' : (sentConfirmations.has(r.id) ? 'Confirmation pass sent' : 'Send Payment Confirmation & Pass Email')"
                      @click="sendConfirmationEmail(r)"
                    >
                      {{ sentConfirmations.has(r.id) ? 'Sent ✓' : 'Confirm' }}
                    </UButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- SIGN-OFF FOOTER -->
    <footer class="relative z-10 w-full max-w-7xl mx-auto px-4 py-6 border-t border-primary-100/10 text-center font-type text-[10px] text-primary-200/30 uppercase tracking-widest mt-auto">
      Luckytin Fan Support © 2026 // Forgotten Island Admin Console
    </footer>
  </div>
</template>

<style scoped>
/* Beach rip ticket style */
.rip {
  background-image: radial-gradient(circle at 0px 50%, transparent 8px, #fdfbf7 8px),
                    radial-gradient(circle at 100% 50%, transparent 8px, #fdfbf7 8px);
  background-position: left, right;
  background-repeat: no-repeat;
}

/* Background grid styling for receipt borders */
.bg-gingham-yellow-blue {
  background-color: #ebdcb3;
  background-image:
    linear-gradient(90deg, rgba(31,64,114,0.1) 50%, transparent 50%),
    linear-gradient(rgba(31,64,114,0.1) 50%, transparent 50%);
  background-size: 16px 16px;
}
</style>
