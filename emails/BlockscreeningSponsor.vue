<script setup lang="ts">
import EmailLayout from './components/EmailLayout.vue'
import { EMAIL_COLOR_MALOI as MALOI, EMAIL_TEXT as TEXT } from './theme'

// Final confirmation for sponsors who won't attend themselves
defineProps<{
  name: string
  eventName: string
  regId: string
  kids: number
  when: string
}>()
</script>

<template>
  <EmailLayout
    :subject="`Thank you for sponsoring [${regId}] - ${eventName}`"
    :preview="`Your sponsorship for ${eventName} is confirmed.`"
    :greeting="`Hi, ${name}! 💙💛`"
    signoff="With gratitude,"
  >
    <EText :style="TEXT">
      Your payment has been verified. Thank you for sponsoring <strong>{{ kids === 1 ? 'a child' : `${kids} children` }}</strong> from <strong>Bahay Tuluyan</strong>! Because of you, they'll get to watch the movie in the cinema on {{ when }}, along with the goodies and inclusions prepared for them.
    </EText>

    <EText :style="{ ...TEXT, fontSize: '14px', borderLeft: `4px solid ${MALOI}`, paddingLeft: '14px' }">
      <strong>No need to attend:</strong> your sponsored {{ kids === 1 ? 'child has a designated seat' : 'children have designated seats' }} and will be looked after by the Bahay Tuluyan team and LTFS volunteers on the day.
    </EText>

    <EText :style="{ ...TEXT, margin: '0 0 24px' }">
      We'll share photos from the screening on our socials. Keep your Registration ID (<strong>{{ regId }}</strong>) in case you need to reach us about your sponsorship.
    </EText>
  </EmailLayout>
</template>
