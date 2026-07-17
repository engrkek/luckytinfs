import type { LetterAssetOption, LetterRecipient } from './types'

export const LETTER_RECIPIENTS: { id: LetterRecipient, label: string, description: string }[] = [
  { id: 'maloi', label: 'Maloi', description: 'Send a letter to Maloi' },
  { id: 'jhoanna', label: 'Jhoanna', description: 'Send a letter to Jhoanna' },
  { id: 'bini', label: 'BINI', description: 'Send a letter to BINI' },
]

/** Public URL under /public/images/letters */
export function letterImageUrl(
  kind: 'backgrounds' | 'seals' | 'stickers',
  file: number | string,
) {
  return `/images/letters/${kind}/${file}.png`
}

export const LETTER_BACKGROUNDS: LetterAssetOption[] = [
  { id: 'bg-14', label: 'Blue gingham', preview: letterImageUrl('backgrounds', 14) },
  { id: 'bg-15', label: 'Sky dots', preview: letterImageUrl('backgrounds', 15) },
  { id: 'bg-16', label: 'Blush stripes', preview: letterImageUrl('backgrounds', 16) },
  { id: 'bg-17', label: 'Sky stripes', preview: letterImageUrl('backgrounds', 17) },
  { id: 'bg-18', label: 'Mint wash', preview: letterImageUrl('backgrounds', 18) },
  { id: 'bg-19', label: 'Sea rings', preview: letterImageUrl('backgrounds', 19) },
  { id: 'bg-20', label: 'Aqua glow', preview: letterImageUrl('backgrounds', 20) },
  { id: 'bg-21', label: 'Teal check', preview: letterImageUrl('backgrounds', 21) },
]

export const LETTER_FONTS: LetterAssetOption[] = [
  { id: 'hand', label: 'Handwriting' },
  { id: 'script', label: 'Script' },
  { id: 'type', label: 'Typewriter' },
  { id: 'sans', label: 'Clean sans' },
]

/** Color-only envelopes (shared paper grain in CSS) */
export const LETTER_ENVELOPES: LetterAssetOption[] = [
  { id: 'envelope-white', label: 'White' },
  { id: 'envelope-cream', label: 'Cream' },
  { id: 'envelope-blush', label: 'Blush' },
  { id: 'envelope-sky', label: 'Sky' },
  { id: 'envelope-lilac', label: 'Lilac' },
  { id: 'envelope-mint', label: 'Mint' },
  { id: 'envelope-kraft', label: 'Kraft' },
  { id: 'envelope-slate', label: 'Slate' },
]

export const LETTER_SEALS: LetterAssetOption[] = [
  { id: 'seal-1', label: 'Ice blank', preview: letterImageUrl('seals', 1) },
  { id: 'seal-2', label: 'Pink bow', preview: letterImageUrl('seals', 2) },
  { id: 'seal-3', label: 'Gold plume', preview: letterImageUrl('seals', 3) },
  { id: 'seal-4', label: 'Forest bloom', preview: letterImageUrl('seals', 4) },
  { id: 'seal-5', label: 'Sunburst', preview: letterImageUrl('seals', 5) },
  { id: 'seal-6', label: 'Blue sprig', preview: letterImageUrl('seals', 6) },
  { id: 'seal-7', label: 'Gold heart', preview: letterImageUrl('seals', 7) },
  { id: 'seal-8', label: 'Royal blue', preview: letterImageUrl('seals', 8) },
  { id: 'seal-9', label: 'Red heart', preview: letterImageUrl('seals', 9) },
  { id: 'seal-10', label: 'Lilac blank', preview: letterImageUrl('seals', 10) },
  { id: 'seal-11', label: 'Jade blank', preview: letterImageUrl('seals', 11) },
  { id: 'seal-12', label: 'Blue botanical', preview: letterImageUrl('seals', 12) },
  { id: 'seal-13', label: 'Rose stamp', preview: letterImageUrl('seals', 13) },
]

export const LETTER_STICKERS: LetterAssetOption[] = [
  { id: 'sticker-22', label: 'Lightstick tilt', preview: letterImageUrl('stickers', 22) },
  { id: 'sticker-23', label: 'Lightstick', preview: letterImageUrl('stickers', 23) },
  { id: 'sticker-24', label: 'Pink cosmos', preview: letterImageUrl('stickers', 24) },
  { id: 'sticker-25', label: 'Blue blooms', preview: letterImageUrl('stickers', 25) },
  { id: 'sticker-26', label: 'Aqua hibiscus', preview: letterImageUrl('stickers', 26) },
  { id: 'sticker-27', label: 'Yellow hibiscus', preview: letterImageUrl('stickers', 27) },
  { id: 'sticker-28', label: 'Daisies', preview: letterImageUrl('stickers', 28) },
  { id: 'sticker-29', label: 'Daisy', preview: letterImageUrl('stickers', 29) },
  { id: 'sticker-30', label: 'White lily', preview: letterImageUrl('stickers', 30) },
  { id: 'sticker-31', label: 'Yellow daisy', preview: letterImageUrl('stickers', 31) },
  { id: 'sticker-32', label: 'Peony', preview: letterImageUrl('stickers', 32) },
]

export const LETTER_DEFAULTS = {
  background: 'bg-18' as const,
  font: LETTER_FONTS[0]!.id,
  envelope: LETTER_ENVELOPES[0]!.id,
  seal: 'seal-7' as const,
  /** YouTube watch URL, e.g. https://www.youtube.com/watch?v=… */
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
  backgrounds: [
    'bg-14',
    'bg-15',
    'bg-16',
    'bg-17',
    'bg-18',
    'bg-19',
    'bg-20',
    'bg-21',
  ] as const,
  fonts: ['hand', 'script', 'type', 'sans'] as const,
  envelopes: [
    'envelope-white',
    'envelope-cream',
    'envelope-blush',
    'envelope-sky',
    'envelope-lilac',
    'envelope-mint',
    'envelope-kraft',
    'envelope-slate',
  ] as const,
  seals: [
    'seal-1',
    'seal-2',
    'seal-3',
    'seal-4',
    'seal-5',
    'seal-6',
    'seal-7',
    'seal-8',
    'seal-9',
    'seal-10',
    'seal-11',
    'seal-12',
    'seal-13',
  ] as const,
  stickers: [
    'sticker-22',
    'sticker-23',
    'sticker-24',
    'sticker-25',
    'sticker-26',
    'sticker-27',
    'sticker-28',
    'sticker-29',
    'sticker-30',
    'sticker-31',
    'sticker-32',
  ] as const,
}
