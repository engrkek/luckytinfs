<script setup lang="ts">
import EmailLayout from './components/EmailLayout.vue'
import { EMAIL_COLOR_JHOANNA as JHOANNA, EMAIL_LABEL as LABEL, EMAIL_TEXT as TEXT, EMAIL_VALUE as VALUE } from './theme'

// Any event: payment verified, here's your pass
withDefaults(defineProps<{
  name: string
  eventName: string
  regId: string
  fullName: string
  when: string
  where?: string | null
  details?: { label: string, value: string }[] // extra pass rows, e.g. ticket type, companions
  reminders?: string[]
}>(), {
  details: () => [],
  reminders: () => [
    'Show this email and a valid ID at check-in. The name on your ID should match your registration.',
    'Can\'t make it? Message us as soon as possible. Slots can be transferred once, subject to approval.',
  ],
})
</script>

<template>
  <EmailLayout
    :subject="`You're in! Your pass for ${eventName} [${regId}]`"
    :preview="`Your slot for ${eventName} is confirmed. See you on ${when}!`"
    :greeting="`Hi, ${name}! 💙💛`"
  >
    <EText :style="TEXT">
      Your payment has been verified and your slot for <strong>{{ eventName }}</strong> is confirmed. Here's your pass:
    </EText>

    <ESection :style="{ backgroundColor: '#ffffff', border: `2px dashed ${JHOANNA}`, borderRadius: '10px', padding: '20px 24px', margin: '0 0 24px' }">
      <EText :style="LABEL">
        Registration ID
      </EText>
      <EText :style="{ ...VALUE, fontFamily: '\'Courier New\', monospace', fontSize: '22px', color: JHOANNA }">
        {{ regId }}
      </EText>
      <EText :style="LABEL">
        Name
      </EText>
      <EText :style="VALUE">
        {{ fullName }}
      </EText>
      <EText :style="LABEL">
        When
      </EText>
      <EText :style="VALUE">
        {{ when }}
      </EText>
      <template v-if="where">
        <EText :style="LABEL">
          Where
        </EText>
        <EText :style="VALUE">
          {{ where }}
        </EText>
      </template>
      <template v-for="d in details" :key="d.label">
        <EText :style="LABEL">
          {{ d.label }}
        </EText>
        <EText :style="VALUE">
          {{ d.value }}
        </EText>
      </template>
    </ESection>

    <template v-if="reminders.length">
      <EText :style="{ ...TEXT, fontWeight: 700, margin: '0 0 8px' }">
        📌 Reminders
      </EText>
      <EText v-for="r in reminders" :key="r" :style="{ ...TEXT, margin: '0 0 8px' }">
        • {{ r }}
      </EText>
    </template>

    <EText :style="{ ...TEXT, margin: '16px 0 24px' }">
      Thank you for joining us. See you there!
    </EText>
  </EmailLayout>
</template>
