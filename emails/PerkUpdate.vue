<script setup lang="ts">
import EmailLayout from './components/EmailLayout.vue'
import { EMAIL_LABEL as LABEL, EMAIL_COLOR_MALOI as MALOI, EMAIL_TEXT as TEXT, EMAIL_VALUE as VALUE } from './theme'

// Donor perks: the office confirmed the shipping fee payment, rejected it, or shipped the parcel
const props = defineProps<{
  name: string
  project: string // campaign title
  status: 'paid' | 'shipped' | 'rejected'
  courier: string
  trackingNo?: string | null // shipped
  amount?: string | null // rejected: formatted shipping fee to pay again
  reason?: string | null // rejected: why, from the office
  perksUrl: string // the donor's /perks page
}>()

const copy = {
  paid: {
    subject: `Shipping fee confirmed for your ${props.project} perks`,
    preview: 'We\'ve verified your shipping fee payment. Your perks ship soon.',
    button: 'View your perks →',
  },
  shipped: {
    subject: `Your ${props.project} perks are on the way!`,
    preview: `Your perks have shipped via ${props.courier}.`,
    button: 'View your perks →',
  },
  rejected: {
    subject: `Please resubmit your shipping fee payment for your ${props.project} perks`,
    preview: 'We couldn\'t verify your shipping fee payment. Please submit it again.',
    button: 'Resubmit payment →',
  },
}[props.status]
</script>

<template>
  <EmailLayout :subject="copy.subject" :preview="copy.preview" :greeting="`Hi, ${name}! 💙💛`">
    <EText v-if="status === 'shipped'" :style="TEXT">
      Your perks for <strong>{{ project }}</strong> have been shipped. Thank you for supporting Maloi &amp; Jhoanna!
    </EText>
    <EText v-else-if="status === 'paid'" :style="TEXT">
      We've verified your shipping fee payment for your <strong>{{ project }}</strong> perks. They're being packed and we'll email you again once they ship.
    </EText>
    <template v-else>
      <EText :style="TEXT">
        We couldn't verify the shipping fee payment you submitted for your <strong>{{ project }}</strong> perks<template v-if="amount">
          ({{ amount }})
        </template>. Please check your payment and submit the details again through the link below.
      </EText>
      <EText v-if="reason" :style="{ ...TEXT, borderLeft: `4px solid ${MALOI}`, paddingLeft: '14px' }">
        <strong>Note from the team:</strong> {{ reason }}
      </EText>
    </template>

    <ESection v-if="status === 'shipped'" :style="{ backgroundColor: '#ffffff', border: '1px solid #e4ddcb', borderRadius: '10px', padding: '20px 24px', margin: '0 0 24px' }">
      <EText :style="LABEL">
        Courier
      </EText>
      <EText :style="trackingNo ? VALUE : { ...VALUE, margin: 0 }">
        {{ courier }}
      </EText>
      <template v-if="trackingNo">
        <EText :style="LABEL">
          Tracking no.
        </EText>
        <EText :style="{ ...VALUE, fontFamily: '\'Courier New\', monospace', margin: 0 }">
          {{ trackingNo }}
        </EText>
      </template>
    </ESection>

    <ESection style="text-align: center; padding: 8px 0 24px;">
      <EButton
        :href="perksUrl"
        :style="{ backgroundColor: MALOI, color: '#1d2c49', padding: '14px 32px', borderRadius: '9999px', fontWeight: 700, fontSize: '15px', textDecoration: 'none' }"
      >
        {{ copy.button }}
      </EButton>
    </ESection>

    <EText v-if="status === 'rejected'" :style="{ ...TEXT, fontSize: '14px', color: '#8a8272' }">
      If you think this is a mistake, just reply to this email and we'll sort it out.
    </EText>
  </EmailLayout>
</template>
