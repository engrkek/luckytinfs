<script setup lang="ts">
import EmailLayout from './components/EmailLayout.vue'
import { EMAIL_COLOR_JHOANNA as JHOANNA, EMAIL_LABEL as LABEL, EMAIL_COLOR_MALOI as MALOI, EMAIL_TEXT as TEXT, EMAIL_VALUE as VALUE } from './theme'

// Donation verified: thank-you + receipt
defineProps<{
  name: string
  amount: string // formatted, e.g. ₱1,500
  project?: string | null // campaign title; null = "wherever it's most needed"
  channel: string // e.g. GCash
  refNo?: string | null
  date: string // formatted date the donation was made
  total?: string | null // formatted cumulative approved total for this project, shown with a tier
  tier?: { name: string, items: string[] } | null // only when this donation crosses into it: pass newlyUnlockedTier()
  perksUrl?: string | null // the donor's /perks form, shown with a tier
}>()
</script>

<template>
  <EmailLayout
    :subject="`Thank you! Your ${amount} donation is confirmed`"
    :preview="`We've verified your donation of ${amount}. Thank you for supporting Maloi & Jhoanna!`"
    :greeting="`Hi, ${name}! 💙💛`"
  >
    <EText :style="TEXT">
      We've verified your donation and it's now counted toward <strong>{{ project || 'where it\'s most needed' }}</strong>. Thank you for supporting Maloi &amp; Jhoanna!
    </EText>

    <ESection :style="{ backgroundColor: '#ffffff', border: '1px solid #e4ddcb', borderRadius: '10px', padding: '20px 24px', margin: '0 0 24px' }">
      <EText :style="LABEL">
        Amount
      </EText>
      <EText :style="{ ...VALUE, fontSize: '22px', color: JHOANNA }">
        {{ amount }}
      </EText>
      <EText :style="LABEL">
        Project
      </EText>
      <EText :style="VALUE">
        {{ project || 'Where it\'s most needed' }}
      </EText>
      <EText :style="LABEL">
        Sent via
      </EText>
      <EText :style="VALUE">
        {{ channel }}
      </EText>
      <template v-if="refNo">
        <EText :style="LABEL">
          Reference no.
        </EText>
        <EText :style="{ ...VALUE, fontFamily: '\'Courier New\', monospace' }">
          {{ refNo }}
        </EText>
      </template>
      <EText :style="LABEL">
        Date
      </EText>
      <EText :style="VALUE">
        {{ date }}
      </EText>
    </ESection>

    <ESection v-if="tier" :style="{ backgroundColor: '#fdf6d8', borderLeft: `4px solid ${MALOI}`, borderRadius: '10px', padding: '20px 24px', margin: '0 0 24px' }">
      <EText :style="{ ...TEXT, fontWeight: 700, margin: '0 0 8px' }">
        🎁 You've unlocked {{ tier.name }}!
      </EText>
      <EText :style="{ ...TEXT, margin: '0 0 12px' }">
        <template v-if="total">
          Your donations to this project now total <strong>{{ total }}</strong>, which gets you:
        </template>
        <template v-else>
          Your perks:
        </template>
      </EText>
      <!-- one block with <br>s so the perks sit together as a list, not spaced like paragraphs -->
      <EText :style="{ ...TEXT, lineHeight: '24px', margin: '0 0 12px', paddingLeft: '4px' }">
        <template v-for="(item, i) in tier.items" :key="item">
          <br v-if="i">• {{ item }}
        </template>
      </EText>
      <template v-if="perksUrl">
        <EText :style="{ ...TEXT, margin: '0 0 16px' }">
          Tell us where to send them:
        </EText>
        <EButton
          :href="perksUrl"
          :style="{ backgroundColor: MALOI, color: '#1d2c49', padding: '12px 28px', borderRadius: '9999px', fontWeight: 700, fontSize: '15px', textDecoration: 'none' }"
        >
          Claim your perks →
        </EButton>
      </template>
      <EText v-else :style="{ ...TEXT, fontSize: '14px', color: '#8a8272', margin: 0 }">
        We'll reach out about claiming your perks.
      </EText>
    </ESection>

    <EText :style="{ ...TEXT, margin: '0 0 24px' }">
      Keep this email as your receipt. If anything above looks wrong, just reply and we'll sort it out.
    </EText>
  </EmailLayout>
</template>
