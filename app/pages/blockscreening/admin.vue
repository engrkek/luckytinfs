<script setup lang="ts">
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

const {
  registrations,
  isPending,
  isCheckingAuth,
  isAuthorized,
  error,
  loginError,
  fetchRegistrations,
} = useBlockscreeningRegistrations()

const toast = useBlockscreeningToast()

onMounted(() => {
  fetchRegistrations()
})

// Search & Filter State
const searchQuery = ref('')
const platformFilter = ref('all')
const childFilter = ref('all')
const paymentFilter = ref('all')

const isFiltered = computed(() =>
  Boolean(searchQuery.value || platformFilter.value !== 'all' || childFilter.value !== 'all' || paymentFilter.value !== 'all'))

const filteredRegistrations = computed(() => {
  return registrations.value.filter((r) => {
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

    const platformMatch = platformFilter.value === 'all'
      || r.primaryPlatform === platformFilter.value
      || r.otherPlatform === platformFilter.value

    const childMatch = childFilter.value === 'all'
      || (childFilter.value === 'sponsor' && (r.childRegistration === 'sponsor' || r.childRegistration === 'sponsor_one'))
      || (childFilter.value === 'sponsor_two' && (r.childRegistration === 'sponsor_two' || r.childRegistration === 'sponsor_2'))
      || (childFilter.value === 'bring' && r.childRegistration === 'bring')
      || r.childRegistration === childFilter.value

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

function sponsoredKidsFor(list: typeof registrations.value) {
  return list.reduce((total, r) => {
    if (r.childRegistration === 'sponsor_two' || r.childRegistration === 'sponsor_2')
      return total + 2
    if (r.childRegistration === 'sponsor' || r.childRegistration === 'sponsor_one')
      return total + 1
    return total
  }, 0)
}

const sponsoredKidsCount = computed(() => sponsoredKidsFor(registrations.value))
const filteredSponsoredKidsCount = computed(() => sponsoredKidsFor(filteredRegistrations.value))
const collectedRevenue = computed(() => paidSlotsCount.value * 1500)

const filteredTotalSlots = computed(() => filteredRegistrations.value.length)
const filteredPaidCount = computed(() => filteredRegistrations.value.filter(r => r.paid).length)

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
</script>

<template>
  <div class="min-h-dvh flex flex-col justify-between bg-secondary-600 bg-[url('/images/textures/06.jpg')] bg-blend-screen overflow-x-hidden relative">
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
      v-if="toast.message.value"
      class="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium transition-all animate-bounce"
      :class="toast.type.value === 'success' ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40' : 'bg-rose-950/90 text-rose-200 border-rose-500/40'"
    >
      <UIcon :name="toast.type.value === 'success' ? 'ph:check-circle-bold' : 'ph:warning-circle-bold'" class="size-5 shrink-0" />
      <span>{{ toast.message.value }}</span>
    </div>

    <!-- 1. CHECKING AUTHENTICATION LOADER -->
    <div v-if="isCheckingAuth" class="relative z-10 w-full flex-1 flex flex-col items-center justify-center py-20 text-primary-200/50 gap-3">
      <UIcon name="ph:circle-notch" class="size-8 animate-spin text-primary-300" />
      <p class="text-sm font-medium">
        Verifying console access...
      </p>
    </div>

    <!-- 2. LOGIN PASSCODE INTERFACE -->
    <BlockscreeningAdminPasscodeGate
      v-else-if="!isAuthorized"
      :loading="isPending"
      :error="loginError"
      @submit="fetchRegistrations($event)"
    />

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

      <BlockscreeningRegistrationsSummary
        :total-slots="totalSlots"
        :filtered-total-slots="filteredTotalSlots"
        :paid-slots-count="paidSlotsCount"
        :filtered-paid-count="filteredPaidCount"
        :collected-revenue="collectedRevenue"
        :unpaid-slots-count="unpaidSlotsCount"
        :sponsored-kids-count="sponsoredKidsCount"
        :filtered-sponsored-kids-count="filteredSponsoredKidsCount"
        :is-filtered="isFiltered"
      />

      <BlockscreeningRegistrationsFilters
        v-model:search-query="searchQuery"
        v-model:platform-filter="platformFilter"
        v-model:child-filter="childFilter"
        v-model:payment-filter="paymentFilter"
        :is-pending="isPending"
        :has-results="filteredRegistrations.length > 0"
        @export="exportToCSV"
        @refresh="fetchRegistrations()"
      />

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
          <UButton size="sm" @click="fetchRegistrations()">
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
        <BlockscreeningRegistrationsTable v-else :registrations="filteredRegistrations" />
      </section>
    </div>

    <!-- SIGN-OFF FOOTER -->
    <footer class="relative z-10 w-full max-w-7xl mx-auto px-4 py-6 border-t border-primary-100/10 text-center font-type text-[10px] text-primary-200/30 uppercase tracking-widest mt-auto">
      Luckytin Fan Support © 2026 // Forgotten Island Admin Console
    </footer>
  </div>
</template>
