<script setup lang="ts">
import EmailLayout from './components/EmailLayout.vue'
import { EMAIL_COLOR_MALOI as MALOI, EMAIL_TEXT as TEXT } from './theme'

// Donor perks: "you earned perks, tell us where to send them"
defineProps<{
  name: string
  project: string // campaign title
  tiers: { name: string, items: string[] }[] // every tier they've earned
  perksUrl: string // the donor's /perks form
}>()
</script>

<template>
  <EmailLayout
    :subject="`Claim your ${project} perks`"
    :preview="`Your donations to ${project} earned you perks. Tell us where to send them!`"
    :greeting="`Hi, ${name}! 💙💛`"
  >
    <EText :style="TEXT">
      Thank you for supporting <strong>{{ project }}</strong>! Your donations earned you perks, and we're ready to send them your way.
    </EText>

    <ESection :style="{ backgroundColor: '#fdf6d8', borderLeft: `4px solid ${MALOI}`, borderRadius: '10px', padding: '20px 24px', margin: '0 0 24px' }">
      <template v-for="(tier, t) in tiers" :key="tier.name">
        <EText :style="{ ...TEXT, fontWeight: 700, margin: t ? '12px 0 4px' : '0 0 4px' }">
          🎁 {{ tier.name }}
        </EText>
        <!-- one block with <br>s so the perks sit together as a list, not spaced like paragraphs -->
        <EText :style="{ ...TEXT, lineHeight: '24px', margin: 0, paddingLeft: '4px' }">
          <template v-for="(item, i) in tier.items" :key="item">
            <br v-if="i">• {{ item }}
          </template>
        </EText>
      </template>
    </ESection>

    <EText :style="TEXT">
      Fill in your shipping details through the link below. We'll then email you the shipping fee for the courier you choose.
    </EText>

    <ESection style="text-align: center; padding: 8px 0 24px;">
      <EButton
        :href="perksUrl"
        :style="{ backgroundColor: MALOI, color: '#1d2c49', padding: '14px 32px', borderRadius: '9999px', fontWeight: 700, fontSize: '15px', textDecoration: 'none' }"
      >
        Claim your perks →
      </EButton>
    </ESection>
  </EmailLayout>
</template>
