<script setup lang="ts">
import EmailLayout from './components/EmailLayout.vue'
import { EMAIL_COLOR_JHOANNA as JHOANNA, EMAIL_LABEL as LABEL, EMAIL_COLOR_MALOI as MALOI, EMAIL_TEXT as TEXT, EMAIL_VALUE as VALUE } from './theme'

// Donor perks: "here's your shipping fee, pay it so we can send your perks"
defineProps<{
  name: string
  project: string // campaign title
  amount: string // formatted shipping fee, e.g. ₱150
  courier: string
  recipientName: string
  address: string
  paymentUrl: string
}>()
</script>

<template>
  <EmailLayout
    :subject="`Your perks are ready to ship: ${amount} shipping fee`"
    :preview="`Pay the ${amount} shipping fee so we can send your ${project} perks.`"
    :greeting="`Hi, ${name}! 💙💛`"
  >
    <EText :style="TEXT">
      Your perks for <strong>{{ project }}</strong> are ready to ship! Here's the shipping fee for the courier you chose.
    </EText>

    <ESection :style="{ backgroundColor: '#ffffff', border: '1px solid #e4ddcb', borderRadius: '10px', padding: '20px 24px', margin: '0 0 24px' }">
      <EText :style="LABEL">
        Shipping fee
      </EText>
      <EText :style="{ ...VALUE, fontSize: '22px', color: JHOANNA }">
        {{ amount }}
      </EText>
      <EText :style="LABEL">
        Courier
      </EText>
      <EText :style="VALUE">
        {{ courier }}
      </EText>
      <EText :style="LABEL">
        Ship to
      </EText>
      <EText :style="{ ...VALUE, margin: 0 }">
        {{ recipientName }}<br>{{ address }}
      </EText>
    </ESection>

    <ESection style="text-align: center; padding: 8px 0 24px;">
      <EButton
        :href="paymentUrl"
        :style="{ backgroundColor: MALOI, color: '#1d2c49', padding: '14px 32px', borderRadius: '9999px', fontWeight: 700, fontSize: '15px', textDecoration: 'none' }"
      >
        Pay shipping fee →
      </EButton>
    </ESection>

    <EText :style="{ ...TEXT, fontSize: '14px', color: '#8a8272' }">
      If the address above is wrong, reply to this email before paying and we'll fix it.
    </EText>
  </EmailLayout>
</template>
