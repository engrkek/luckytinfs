// Shared across email templates. Values mirror app/assets/css/main.css's @theme tokens —
// kept as plain constants (not CSS custom properties) because var() isn't reliably supported
// in email clients (Outlook's Word engine won't resolve it); inline hex values are the safe bet.
// Update this file if those tokens change.
export const EMAIL_FONT_DISPLAY = `'Fraunces', Georgia, 'Times New Roman', serif`
export const EMAIL_FONT_SANS = `'Karla', Helvetica, Arial, sans-serif`

export const EMAIL_COLOR_PAPER = '#f7f4ee' // --color-paper
export const EMAIL_COLOR_INK = '#1d2c49' // --color-jhoanna-900
export const EMAIL_COLOR_MALOI = '#f5d042' // --color-maloi-500
export const EMAIL_COLOR_JHOANNA = '#34558b' // --color-jhoanna-600

export const EMAIL_TEXT = { fontFamily: EMAIL_FONT_SANS, fontSize: '15px', lineHeight: '26px', color: EMAIL_COLOR_INK, margin: '0 0 16px' }
export const EMAIL_LABEL = { fontFamily: EMAIL_FONT_SANS, fontSize: '11px', lineHeight: '16px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, color: '#8a8272', margin: 0 } as const
export const EMAIL_VALUE = { fontFamily: EMAIL_FONT_SANS, fontSize: '16px', lineHeight: '24px', fontWeight: 700, color: EMAIL_COLOR_INK, margin: '0 0 14px' }
