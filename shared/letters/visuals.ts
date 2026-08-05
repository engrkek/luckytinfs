import type { LetterRecipient } from './types'
import { letterImageUrl } from './assets'

export interface PaperStyle {
  /** Optional legacy CSS class (unused for image papers) */
  class: string
  ink: string
  /** Public image URL for paper texture */
  src?: string
  /**
   * Soft white wash over the texture so ink stays readable (0–1).
   * Busier patterns need more wash.
   */
  wash?: number
}

export const PAPER_STYLES: Record<string, PaperStyle> = {
  'bg-1': { class: 'letter-paper--image', ink: '#1a2430', src: letterImageUrl('backgrounds', 1), wash: 0.58 },
  'bg-2': { class: 'letter-paper--image', ink: '#1f2a38', src: letterImageUrl('backgrounds', 2), wash: 0.42 },
  'bg-3': { class: 'letter-paper--image', ink: '#2a2428', src: letterImageUrl('backgrounds', 3), wash: 0.28 },
  'bg-4': { class: 'letter-paper--image', ink: '#1f2a38', src: letterImageUrl('backgrounds', 4), wash: 0.28 },
  'bg-5': { class: 'letter-paper--image', ink: '#243028', src: letterImageUrl('backgrounds', 5), wash: 0.18 },
  'bg-6': { class: 'letter-paper--image', ink: '#1e2c32', src: letterImageUrl('backgrounds', 6), wash: 0.32 },
  'bg-7': { class: 'letter-paper--image', ink: '#1a2e32', src: letterImageUrl('backgrounds', 7), wash: 0.22 },
  'bg-8': { class: 'letter-paper--image', ink: '#1a2a30', src: letterImageUrl('backgrounds', 8), wash: 0.48 },
  'bg-9': { class: 'letter-paper--image', ink: '#3a2f10', src: letterImageUrl('backgrounds', 9), wash: 0.55 },
  'bg-10': { class: 'letter-paper--image', ink: '#3a2f10', src: letterImageUrl('backgrounds', 10), wash: 0.3 },
  'bg-11': { class: 'letter-paper--image', ink: '#332a10', src: letterImageUrl('backgrounds', 11), wash: 0.22 },
  'bg-12': { class: 'letter-paper--image', ink: '#3a2f10', src: letterImageUrl('backgrounds', 12), wash: 0.3 },
  'bg-13': { class: 'letter-paper--image', ink: '#123236', src: letterImageUrl('backgrounds', 13), wash: 0.55 },
  'bg-14': { class: 'letter-paper--image', ink: '#123236', src: letterImageUrl('backgrounds', 14), wash: 0.22 },
  'bg-15': { class: 'letter-paper--image', ink: '#123236', src: letterImageUrl('backgrounds', 15), wash: 0.28 },
  'bg-16': { class: 'letter-paper--image', ink: '#2a241c', src: letterImageUrl('backgrounds', 16), wash: 0.12 },
  'bg-17': { class: 'letter-paper--image', ink: '#2a241c', src: letterImageUrl('backgrounds', 17), wash: 0.15 },
  'bg-18': { class: 'letter-paper--image', ink: '#123236', src: letterImageUrl('backgrounds', 18), wash: 0.35 },
  'bg-19': { class: 'letter-paper--image', ink: '#2a241c', src: letterImageUrl('backgrounds', 19), wash: 0.2 },
  'bg-20': { class: 'letter-paper--image', ink: '#16303a', src: letterImageUrl('backgrounds', 20), wash: 0.32 },
  'bg-21': { class: 'letter-paper--image', ink: '#3a2f10', src: letterImageUrl('backgrounds', 21), wash: 0.4 },
  'bg-22': { class: 'letter-paper--image', ink: '#2e2418', src: letterImageUrl('backgrounds', 22), wash: 0.22 },
}

export const FONT_STYLES: Record<string, string> = {
  hand: 'font-hand tracking-wide',
  script: 'font-script tracking-normal',
  type: 'font-type tracking-tight',
  sans: 'font-sans tracking-normal',
  casual: 'font-casual tracking-wide',
  seine: 'font-seine tracking-normal',
  crayon: 'font-crayon tracking-wide',
  bloom: 'font-bloom tracking-normal',
  handflair: 'font-handflair tracking-wide',
  lazy: 'font-lazy tracking-wide',
  jardin: 'font-jardin tracking-normal',
  privilege: 'font-privilege tracking-normal',
  salmon: 'font-salmon tracking-normal',
  summer: 'font-summer tracking-wide',
  nanti: 'font-nanti tracking-normal',
}

/**
 * Body / signature sizes for letter text.
 * Decorative handwriting fonts read optically small, so this scale sits
 * well above default UI type (M ≈ former script default, XL is display-y).
 */
export const FONT_SIZE_STYLES: Record<string, { body: string, signature: string }> = {
  sm: {
    body: 'text-[1.05rem] sm:text-[1.2rem] leading-relaxed',
    signature: 'text-[1.15rem] sm:text-[1.3rem]',
  },
  md: {
    body: 'text-[1.35rem] sm:text-[1.55rem] leading-snug',
    signature: 'text-[1.45rem] sm:text-[1.7rem]',
  },
  lg: {
    body: 'text-[1.7rem] sm:text-[1.95rem] leading-snug',
    signature: 'text-[1.85rem] sm:text-[2.15rem]',
  },
  xl: {
    body: 'text-[2.15rem] sm:text-[2.5rem] leading-tight',
    signature: 'text-[2.3rem] sm:text-[2.7rem]',
  },
}

/** Solid color envelopes — same paper grain overlay, only hue changes */
export const ENVELOPE_STYLES: Record<string, { face: string, flap: string, edge: string }> = {
  'envelope-white': { face: '#f7f3ec', flap: '#efe8dc', edge: '#d9d0c2' },
  'envelope-cream': { face: '#f3e6c8', flap: '#e8d6a8', edge: '#d2bc8a' },
  'envelope-blush': { face: '#f6d9d6', flap: '#efc4c0', edge: '#d9a8a3' },
  'envelope-sky': { face: '#d5e4f4', flap: '#c0d5ec', edge: '#9fb8d4' },
  'envelope-lilac': { face: '#e8dff2', flap: '#d9cce8', edge: '#bba8d0' },
  'envelope-mint': { face: '#d9ebe3', flap: '#c5dfd4', edge: '#9fc0b2' },
  'envelope-kraft': { face: '#c9a66b', flap: '#b89355', edge: '#9a7640' },
  'envelope-slate': { face: '#d0d6de', flap: '#bec6d0', edge: '#9aa5b2' },
}

export function sealSrc(id: string): string | null {
  const m = /^seal-(\d+)$/.exec(id)
  if (!m)
    return null
  return letterImageUrl('seals', m[1]!)
}

export function stickerSrc(id: string): string | null {
  const m = /^sticker-(\d+)$/.exec(id)
  if (!m)
    return null
  return letterImageUrl('stickers', m[1]!)
}

export const RECIPIENT_THEME: Record<LetterRecipient, {
  label: string
  accent: string
  soft: string
  deep: string
  gingham: string
  postmark: string
  toLine: string
}> = {
  maloi: {
    label: 'Maloi',
    accent: 'var(--color-maloi-400)',
    soft: 'var(--color-maloi-50)',
    deep: 'var(--color-maloi-900)',
    gingham: 'bg-gingham-yellow',
    postmark: 'FOR MALOI',
    toLine: 'For Maloi 💛',
  },
  jhoanna: {
    label: 'Jhoanna',
    accent: 'var(--color-jhoanna-400)',
    soft: 'var(--color-jhoanna-50)',
    deep: 'var(--color-jhoanna-900)',
    gingham: 'bg-gingham-blue',
    postmark: 'FOR JHOANNA',
    toLine: 'For Jhoanna 💙',
  },
  bini: {
    label: 'BINI',
    accent: 'var(--color-bini-400)',
    soft: 'var(--color-bini-50)',
    deep: 'var(--color-bini-900)',
    gingham: 'bg-gingham-yellow-blue',
    postmark: 'FOR BINI',
    toLine: 'For BINI 🌸',
  },
}

/** Postbox paint per recipient — yellow / blue / teal */
export const MAILBOX_PAINT: Record<LetterRecipient, { body: string, deep: string, soft: string }> = {
  maloi: { body: '#ecc94b', deep: '#8f741c', soft: '#fdf3cf' },
  jhoanna: { body: 'var(--color-jhoanna-600)', deep: 'var(--color-jhoanna-900)', soft: 'var(--color-jhoanna-100)' },
  bini: { body: '#63cbd6', deep: '#2b7680', soft: '#eafafc' },
}

export function paperOf(id: string): PaperStyle {
  return PAPER_STYLES[id] ?? PAPER_STYLES['bg-1']!
}

export function fontOf(id: string) {
  return FONT_STYLES[id] ?? FONT_STYLES.hand!
}

export function fontSizeOf(id?: string) {
  return FONT_SIZE_STYLES[id ?? 'md'] ?? FONT_SIZE_STYLES.md!
}

/** Family + size for letter body text */
export function bodyTypeOf(fontId: string, sizeId?: string) {
  return `${fontOf(fontId)} ${fontSizeOf(sizeId).body}`
}

/** Family + size for the signature line */
export function signatureTypeOf(fontId: string, sizeId?: string) {
  return `${fontOf(fontId)} ${fontSizeOf(sizeId).signature}`
}

export function envelopeOf(id: string) {
  return ENVELOPE_STYLES[id] ?? ENVELOPE_STYLES['envelope-cream']!
}
