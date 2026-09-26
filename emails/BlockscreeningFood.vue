<script setup lang="ts">
import { FOOD_DEADLINE_LABEL, FOOD_DEFAULT } from '../shared/blockscreening'
import EmailLayout from './components/EmailLayout.vue'
import { EMAIL_COLOR_MALOI as MALOI, EMAIL_TEXT as TEXT } from './theme'

// people defaults to [] so the DevTools preview (rendered without props) doesn't crash
withDefaults(defineProps<{
  name: string
  eventName: string
  regId: string
  people?: string[] // registrant + their own kids
  foodUrl: string
}>(), {
  people: () => [],
})
</script>

<template>
  <EmailLayout
    :subject="`Choose your meal [${regId}] - ${eventName}`"
    :preview="`Pick a meal for ${eventName}.`"
    :greeting="`Hi, ${name}! 🍿`"
  >
    <EText :style="TEXT">
      Your <strong>{{ eventName }}</strong> ticket comes with a meal! Please pick one for {{ people.length > 1 ? 'each person in your registration' : 'yourself' }}:
    </EText>
    <EText :style="TEXT">
      <template v-for="(p, i) in people" :key="p">
        • {{ p }}<br v-if="i < people.length - 1">
      </template>
    </EText>

    <ESection style="text-align: center; padding: 8px 0 24px;">
      <EButton
        :href="foodUrl"
        :style="{ backgroundColor: MALOI, color: '#1d2c49', padding: '14px 32px', borderRadius: '9999px', fontWeight: 700, fontSize: '15px', textDecoration: 'none' }"
      >
        Choose food →
      </EButton>
    </ESection>

    <EText :style="{ ...TEXT, fontSize: '14px', borderLeft: `4px solid ${MALOI}`, paddingLeft: '14px' }">
      <strong>Please choose by {{ FOOD_DEADLINE_LABEL }}.</strong> If we don't hear from you by then, we'll give you {{ FOOD_DEFAULT }}.
    </EText>
  </EmailLayout>
</template>
