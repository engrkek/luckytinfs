<script setup lang="ts">
import {
  EMAIL_FONT_DISPLAY as FONT_DISPLAY,
  EMAIL_FONT_SANS as FONT_SANS,
  EMAIL_COLOR_JHOANNA as JHOANNA,
  EMAIL_COLOR_MALOI as MALOI,
  EMAIL_COLOR_PAPER as PAPER,
} from '../theme'

// Brand frame shared by every template: fonts, accent bar, logo, greeting, sign-off, footer
withDefaults(defineProps<{
  subject: string
  preview?: string
  greeting: string
  signoff?: string
}>(), {
  signoff: 'With love,',
})
</script>

<template>
  <EHtml>
    <ESubject>{{ subject }}</ESubject>
    <EHead>
      <EFont
        font-family="Fraunces"
        :fallback-font-family="['Georgia', 'Times New Roman', 'serif']"
        font-style="italic"
        :web-font="{ url: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@1,400', format: 'woff2' }"
      />
      <EFont
        font-family="Karla"
        :fallback-font-family="['Helvetica', 'Arial', 'sans-serif']"
        :web-font="{ url: 'https://fonts.googleapis.com/css2?family=Karla:wght@400', format: 'woff2' }"
      />
    </EHead>
    <EPreview v-if="preview">
      {{ preview }}
    </EPreview>
    <EBody :style="{ backgroundColor: '#e9e4d8', fontFamily: FONT_SANS }">
      <EContainer :style="{ padding: '32px 20px' }">
        <ESection :style="{ backgroundColor: PAPER, border: '1px solid #e4ddcb', borderRadius: '10px', overflow: 'hidden' }">
          <!-- two-tone accent bar, matching the maloi (yellow) / jhoanna (blue) brand colors -->
          <ERow>
            <EColumn :style="{ backgroundColor: MALOI, height: '6px', width: '50%' }" />
            <EColumn :style="{ backgroundColor: JHOANNA, height: '6px', width: '50%' }" />
          </ERow>

          <ESection style="padding: 32px 36px 8px;">
            <EImg src="https://luckytinfs.com/images/logos/logo-hr.png" alt="Luckytin Fan Support" width="132" />
          </ESection>

          <ESection style="padding: 12px 36px 0;">
            <EText :style="{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: '24px', color: JHOANNA, margin: '0 0 20px' }">
              {{ greeting }}
            </EText>

            <slot />

            <EHr />

            <EText :style="{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: '16px', color: JHOANNA, margin: '24px 0 0', lineHeight: '24px' }">
              {{ signoff }}<br>
              <strong>Luckytin Fan Support Team</strong>
            </EText>
          </ESection>

          <ESection style="padding: 28px 36px 32px;">
            <EText :style="{ fontFamily: FONT_SANS, fontSize: '12px', color: '#8a8272', margin: 0, textAlign: 'center' }">
              Luckytin Fan Support · A fan support team for BINI Maloi &amp; Jhoanna
            </EText>
          </ESection>
        </ESection>
      </EContainer>
    </EBody>
  </EHtml>
</template>
