<script setup lang="ts">
import EmailLayout from './components/EmailLayout.vue'
import { EMAIL_COLOR_JHOANNA as JHOANNA, EMAIL_COLOR_MALOI as MALOI, EMAIL_TEXT as TEXT } from './theme'

// Any event: "your slot is ready, pay to secure it"
defineProps<{
  name: string
  eventName: string
  regId: string
  amount: string // formatted, e.g. ₱1,500
  item?: string // what they're paying for, e.g. a ticket type
  paymentUrl: string
  deadline: string // finishes "Please pay …"
}>()
</script>

<template>
  <EmailLayout
    :subject="`Complete your payment [${regId}] - ${eventName}`"
    :preview="`Pay ${amount} to secure your slot for ${eventName}.`"
    :greeting="`Hi, ${name}! 💙💛`"
  >
    <EText :style="TEXT">
      Thank you for registering for <strong>{{ eventName }}</strong>! We've reviewed your registration and your slot is ready.
    </EText>

    <ESection :style="{ backgroundColor: '#ffffff', border: '1px solid #e4ddcb', borderRadius: '8px', padding: '16px 20px', margin: '0 0 16px' }">
      <EText :style="{ ...TEXT, margin: 0 }">
        Registration ID: <strong style="font-family: 'Courier New', monospace;">
          {{ regId }}
        </strong><br>
        Amount due: <strong :style="{ color: JHOANNA }">
          {{ amount }}
        </strong><template v-if="item">
          ({{ item }})
        </template>
      </EText>
    </ESection>

    <EText :style="TEXT">
      To secure your slot, pay the amount above and submit your payment details through the link below.
    </EText>

    <ESection style="text-align: center; padding: 8px 0 24px;">
      <EButton
        :href="paymentUrl"
        :style="{ backgroundColor: MALOI, color: '#1d2c49', padding: '14px 32px', borderRadius: '9999px', fontWeight: 700, fontSize: '15px', textDecoration: 'none' }"
      >
        Complete payment →
      </EButton>
    </ESection>

    <EText :style="{ ...TEXT, fontSize: '14px', borderLeft: `4px solid ${MALOI}`, paddingLeft: '14px' }">
      <strong>Please pay {{ deadline }}.</strong> Unpaid slots are forfeited after the deadline and offered to the next registrant.
    </EText>
  </EmailLayout>
</template>
