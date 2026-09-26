<script setup lang="ts">
import { FOOD_DEADLINE_LABEL, FOOD_DEFAULT, FOOD_OPTIONS, isFoodOpen } from '#shared/blockscreening'

useSeoMeta({
  title: 'Block Screening Food of Choice',
  description: 'Choose your meal for Luckytin Fan Support\'s \'Forgotten Island\' Block Screening.',
})

// Server time, so SSR and hydration agree; the POST enforces it too
const foodOpen = useState('blockscreening-food-open', () => isFoodOpen())

const route = useRoute()
const regId = ref(String(route.query.id ?? '').toUpperCase())

interface FoodLookup { nickname: string, people: { name: string, choice: string | null }[] }
const lookup = ref<FoodLookup | null>(null)
const choices = ref<(string | undefined)[]>([])
const error = ref('')
const isLoading = ref(false)
const isSubmitted = ref(false)

function message(err: unknown) {
  const e = err as { data?: { statusMessage?: string }, message?: string }
  return e.data?.statusMessage ?? e.message ?? 'Something went wrong. Please try again.'
}

async function findRegistration() {
  error.value = ''
  if (!regId.value.trim()) {
    error.value = 'Please enter your Registration ID.'
    return
  }
  isLoading.value = true
  try {
    lookup.value = await $fetch<FoodLookup>('/api/blockscreening/food', { query: { id: regId.value.trim() } })
    choices.value = lookup.value.people.map(p => p.choice ?? undefined)
  }
  catch (err) {
    error.value = message(err)
  }
  finally {
    isLoading.value = false
  }
}

async function submit() {
  error.value = ''
  if (choices.value.some(c => !c)) {
    error.value = 'Please choose a meal for everyone.'
    return
  }
  isLoading.value = true
  try {
    await $fetch('/api/blockscreening/food', { method: 'POST', body: { id: regId.value.trim(), choices: choices.value } })
    isSubmitted.value = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  catch (err) {
    error.value = message(err)
  }
  finally {
    isLoading.value = false
  }
}

// Arriving from the email link: skip straight to the choices
onMounted(() => {
  if (regId.value)
    findRegistration()
})
</script>

<template>
  <div class="min-h-dvh flex flex-col bg-secondary-600 bg-[url('/images/textures/06.jpg')] bg-blend-screen overflow-x-hidden">
    <div class="w-full max-w-2xl mx-auto px-4 py-12 sm:py-20 flex-1 flex flex-col justify-center">
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
          Food of Choice
        </p>
      </header>

      <div class="bg-paper text-secondary-950 p-6 sm:p-8 rounded-2xl shadow-2xl border border-[#f0e6d0] space-y-6 text-sm">
        <div v-if="isSubmitted" class="text-center space-y-2 py-4">
          <p class="text-4xl" aria-hidden="true">
            🍿
          </p>
          <h2 class="font-display text-2xl sm:text-3xl text-secondary-900 tracking-tight">
            Got it, {{ lookup?.nickname }}!
          </h2>
          <p class="text-secondary-900/70">
            Your meal choices are saved. You can come back to this page to change them until {{ FOOD_DEADLINE_LABEL }}.
          </p>
        </div>

        <div v-else-if="!foodOpen" class="text-center space-y-2 py-4">
          <p class="text-4xl" aria-hidden="true">
            🍿
          </p>
          <h2 class="font-display text-2xl sm:text-3xl text-secondary-900 tracking-tight">
            Food choices are closed
          </h2>
          <p class="text-secondary-900/70">
            The deadline was {{ FOOD_DEADLINE_LABEL }}. If you didn't choose, you'll get {{ FOOD_DEFAULT }}. See you at the screening!
          </p>
        </div>

        <form v-else-if="lookup" class="space-y-6" @submit.prevent="submit">
          <div class="space-y-1">
            <h2 class="font-display text-2xl sm:text-3xl text-secondary-900 tracking-tight">
              Hi, {{ lookup.nickname }}!
            </h2>
            <p class="text-secondary-900/70">
              Choose one meal for each person in registration <strong class="font-type">
                {{ regId }}
              </strong>.
            </p>
            <p class="text-xs text-[#8c7456]">
              Please choose by <strong>{{ FOOD_DEADLINE_LABEL }}</strong>. If you don't, we'll give you {{ FOOD_DEFAULT }}.
            </p>
          </div>

          <fieldset v-for="(person, i) in lookup.people" :key="person.name" class="space-y-2">
            <legend class="font-semibold text-secondary-900 mb-2">
              {{ person.name }} <span class="text-red-500">*</span>
            </legend>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                v-for="option in FOOD_OPTIONS"
                :key="option"
                class="flex items-center gap-3 p-3 rounded-xl border border-[#ebdcb3] bg-white/40 cursor-pointer hover:bg-maloi-50/10 transition-colors"
                :class="choices[i] === option && 'border-secondary-500 bg-jhoanna-50 ring-1 ring-secondary-500'"
              >
                <input
                  v-model="choices[i]"
                  type="radio"
                  :name="`food-${i}`"
                  :value="option"
                  class="size-4 text-secondary-600"
                >
                <span class="font-semibold text-secondary-900 text-xs">{{ option }}</span>
              </label>
            </div>
          </fieldset>

          <p v-if="error" role="alert" class="text-xs text-[#c43b4d] font-medium">
            {{ error }}
          </p>

          <UButton
            type="submit"
            size="xl"
            block
            :loading="isLoading"
            label="Save meal choices"
            icon="ph:bowl-food-bold"
            class="rounded-full py-3 text-secondary-950 font-bold"
          />
        </form>

        <form v-else class="space-y-4" @submit.prevent="findRegistration">
          <div class="space-y-1">
            <h2 class="font-display text-2xl sm:text-3xl text-secondary-900 tracking-tight">
              Choose your meal
            </h2>
            <p class="text-secondary-900/70">
              Enter the Registration ID from your email to pick meals for you and your companion.
            </p>
            <p class="text-xs text-[#8c7456]">
              Deadline: <strong>{{ FOOD_DEADLINE_LABEL }}</strong>. No answer means {{ FOOD_DEFAULT }}.
            </p>
          </div>
          <div class="space-y-1">
            <label for="reg-id" class="block font-semibold text-secondary-900">
              Registration ID <span class="text-red-500">*</span>
            </label>
            <UInput
              id="reg-id"
              v-model="regId"
              placeholder="e.g. LTFI-7KQM"
              size="md"
              class="w-full font-type uppercase"
              autocomplete="off"
            />
          </div>
          <p v-if="error" role="alert" class="text-xs text-[#c43b4d] font-medium">
            {{ error }}
          </p>
          <UButton
            type="submit"
            size="xl"
            block
            :loading="isLoading"
            label="Continue"
            class="rounded-full py-3 text-secondary-950 font-bold"
          />
        </form>
      </div>
    </div>
  </div>
</template>
