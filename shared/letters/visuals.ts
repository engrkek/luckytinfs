import type { LetterRecipient } from './types'

export const PAPER_STYLES: Record<string, { class: string, ink: string }> = {
  'paper-cream': { class: 'letter-paper--cream', ink: '#2a241c' },
  'paper-lined': { class: 'letter-paper--lined', ink: '#1f2a33' },
  'paper-kraft': { class: 'letter-paper--kraft', ink: '#2c2118' },
  'paper-floral': { class: 'letter-paper--floral', ink: '#3a2a32' },
  'paper-travel': { class: 'letter-paper--travel', ink: '#243040' },
}

export const FONT_STYLES: Record<string, string> = {
  hand: 'font-hand tracking-wide',
  script: 'font-script tracking-normal',
  type: 'font-type tracking-tight',
  sans: 'font-sans tracking-normal',
}

export const ENVELOPE_STYLES: Record<string, { face: string, flap: string, edge: string }> = {
  'envelope-white': { face: '#f7f3ec', flap: '#efe8dc', edge: '#d9d0c2' },
  'envelope-cream': { face: '#f3e6c8', flap: '#e8d6a8', edge: '#d2bc8a' },
  'envelope-blush': { face: '#f6d9d6', flap: '#efc4c0', edge: '#d9a8a3' },
  'envelope-sky': { face: '#d5e4f4', flap: '#c0d5ec', edge: '#9fb8d4' },
  'envelope-kraft': { face: '#c9a66b', flap: '#b89355', edge: '#9a7640' },
}

export const SEAL_STYLES: Record<string, { color: string, glow: string, mark: string }> = {
  'seal-heart': { color: '#b33a4a', glow: '#e06a78', mark: '♥' },
  'seal-star': { color: '#3d5a9a', glow: '#6d8fd4', mark: '★' },
  'seal-flower': { color: '#7a4d8c', glow: '#b07bc4', mark: '✿' },
  'seal-wax-red': { color: '#8b1e2d', glow: '#c43b4d', mark: '◉' },
  'seal-wax-gold': { color: '#a67c2a', glow: '#e0b44a', mark: '✦' },
}

export const STICKER_GLYPHS: Record<string, string> = {
  'sticker-heart': '♥',
  'sticker-star': '★',
  'sticker-flower': '✿',
  'sticker-stamp': '✉',
  'sticker-plane': '✈',
  'sticker-sparkle': '✦',
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

export function paperOf(id: string) {
  return PAPER_STYLES[id] ?? PAPER_STYLES['paper-cream']!
}

export function fontOf(id: string) {
  return FONT_STYLES[id] ?? FONT_STYLES.hand!
}

export function envelopeOf(id: string) {
  return ENVELOPE_STYLES[id] ?? ENVELOPE_STYLES['envelope-cream']!
}

export function sealOf(id: string) {
  return SEAL_STYLES[id] ?? SEAL_STYLES['seal-heart']!
}

export function stickerGlyph(id: string) {
  return STICKER_GLYPHS[id] ?? '✦'
}
