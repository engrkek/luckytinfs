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
  'bg-14': { class: 'letter-paper--image', ink: '#1a2430', src: letterImageUrl('backgrounds', 14), wash: 0.58 },
  'bg-15': { class: 'letter-paper--image', ink: '#1f2a38', src: letterImageUrl('backgrounds', 15), wash: 0.42 },
  'bg-16': { class: 'letter-paper--image', ink: '#2a2428', src: letterImageUrl('backgrounds', 16), wash: 0.28 },
  'bg-17': { class: 'letter-paper--image', ink: '#1f2a38', src: letterImageUrl('backgrounds', 17), wash: 0.28 },
  'bg-18': { class: 'letter-paper--image', ink: '#243028', src: letterImageUrl('backgrounds', 18), wash: 0.18 },
  'bg-19': { class: 'letter-paper--image', ink: '#1e2c32', src: letterImageUrl('backgrounds', 19), wash: 0.32 },
  'bg-20': { class: 'letter-paper--image', ink: '#1a2e32', src: letterImageUrl('backgrounds', 20), wash: 0.22 },
  'bg-21': { class: 'letter-paper--image', ink: '#1a2a30', src: letterImageUrl('backgrounds', 21), wash: 0.48 },
}

export const FONT_STYLES: Record<string, string> = {
  hand: 'font-hand tracking-wide',
  script: 'font-script tracking-normal',
  type: 'font-type tracking-tight',
  sans: 'font-sans tracking-normal',
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
    postmark: 'MALOI · SIGNALS',
    toLine: 'For Maloi 💛',
  },
  jhoanna: {
    label: 'Jhoanna',
    accent: 'var(--color-jhoanna-400)',
    soft: 'var(--color-jhoanna-50)',
    deep: 'var(--color-jhoanna-900)',
    gingham: 'bg-gingham-blue',
    postmark: 'JHOANNA · SIGNALS',
    toLine: 'For Jhoanna 💙',
  },
  bini: {
    label: 'BINI',
    accent: '#c45c8a',
    soft: '#fceef4',
    deep: '#4a1f33',
    gingham: 'bg-gingham-yellow-blue',
    postmark: 'BINI · SIGNALS',
    toLine: 'For BINI 🌸',
  },
}

/** Postbox paint per recipient — yellow / blue / teal */
export const MAILBOX_PAINT: Record<LetterRecipient, { body: string, deep: string, soft: string }> = {
  maloi: { body: '#ecc94b', deep: '#8f741c', soft: '#fdf3cf' },
  jhoanna: { body: 'var(--color-jhoanna-600)', deep: 'var(--color-jhoanna-900)', soft: 'var(--color-jhoanna-100)' },
  bini: { body: '#0f9488', deep: '#0f4f4a', soft: '#d3f5f0' },
}

export function paperOf(id: string): PaperStyle {
  return PAPER_STYLES[id] ?? PAPER_STYLES['bg-18']!
}

export function fontOf(id: string) {
  return FONT_STYLES[id] ?? FONT_STYLES.hand!
}

export function envelopeOf(id: string) {
  return ENVELOPE_STYLES[id] ?? ENVELOPE_STYLES['envelope-cream']!
}
