import type { LetterAssetOption, LetterRecipient } from './types'

export const LETTER_RECIPIENTS: { id: LetterRecipient, label: string, description: string }[] = [
  { id: 'maloi', label: 'Maloi', description: 'Send a letter to Maloi' },
  { id: 'jhoanna', label: 'Jhoanna', description: 'Send a letter to Jhoanna' },
  { id: 'bini', label: 'BINI', description: 'Send a letter to BINI' },
]

export const LETTER_BACKGROUNDS: LetterAssetOption[] = [
  { id: 'paper-cream', label: 'Cream paper' },
  { id: 'paper-lined', label: 'Lined paper' },
  { id: 'paper-kraft', label: 'Kraft paper' },
  { id: 'paper-floral', label: 'Floral wash' },
  { id: 'paper-travel', label: 'Travel map' },
]

export const LETTER_FONTS: LetterAssetOption[] = [
  { id: 'hand', label: 'Handwriting' },
  { id: 'script', label: 'Script' },
  { id: 'type', label: 'Typewriter' },
  { id: 'sans', label: 'Clean sans' },
]

export const LETTER_ENVELOPES: LetterAssetOption[] = [
  { id: 'envelope-white', label: 'White' },
  { id: 'envelope-cream', label: 'Cream' },
  { id: 'envelope-blush', label: 'Blush' },
  { id: 'envelope-sky', label: 'Sky' },
  { id: 'envelope-kraft', label: 'Kraft' },
]

export const LETTER_SEALS: LetterAssetOption[] = [
  { id: 'seal-heart', label: 'Heart' },
  { id: 'seal-star', label: 'Star' },
  { id: 'seal-flower', label: 'Flower' },
  { id: 'seal-wax-red', label: 'Red wax' },
  { id: 'seal-wax-gold', label: 'Gold wax' },
]

export const LETTER_STICKERS: LetterAssetOption[] = [
  { id: 'sticker-heart', label: 'Heart' },
  { id: 'sticker-star', label: 'Star' },
  { id: 'sticker-flower', label: 'Flower' },
  { id: 'sticker-stamp', label: 'Stamp' },
  { id: 'sticker-plane', label: 'Airplane' },
  { id: 'sticker-sparkle', label: 'Sparkle' },
]

export const LETTER_DEFAULTS = {
  background: LETTER_BACKGROUNDS[0]!.id,
  font: LETTER_FONTS[0]!.id,
  envelope: LETTER_ENVELOPES[0]!.id,
  seal: LETTER_SEALS[0]!.id,
  /** Spotify open URL, e.g. https://open.spotify.com/track/… */
  music: undefined as string | undefined,
  stickers: [] as { id: string, x: number, y: number, rotation: number, scale: number }[],
}

export const LETTER_LIMITS = {
  bodyMax: 5000,
  senderNameMax: 50,
  stickersMax: 20,
  musicUrlMax: 500,
} as const

/** Tuple helpers so zod.enum accepts option id lists */
export const LETTER_OPTION_IDS = {
  backgrounds: ['paper-cream', 'paper-lined', 'paper-kraft', 'paper-floral', 'paper-travel'] as const,
  fonts: ['hand', 'script', 'type', 'sans'] as const,
  envelopes: ['envelope-white', 'envelope-cream', 'envelope-blush', 'envelope-sky', 'envelope-kraft'] as const,
  seals: ['seal-heart', 'seal-star', 'seal-flower', 'seal-wax-red', 'seal-wax-gold'] as const,
  stickers: ['sticker-heart', 'sticker-star', 'sticker-flower', 'sticker-stamp', 'sticker-plane', 'sticker-sparkle'] as const,
}
