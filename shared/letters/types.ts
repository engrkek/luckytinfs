export interface LetterStickerPlacement {
  id: string
  x: number
  y: number
  rotation: number
  scale: number
}

export interface LetterDesign {
  /** Absent = letter (pre-postcard rows) */
  format?: 'letter' | 'postcard'
  background: string
  font: string
  /** Body text size — absent on older letters → treat as md */
  fontSize?: string
  envelope: string
  seal: string
  music?: string
  /** Postcard front photo — blob pathname like `postcards/abc.jpg`, served at `/postcards/abc.jpg` */
  photo?: string
  stickers: LetterStickerPlacement[]
}

export type LetterRecipient = 'maloi' | 'jhoanna' | 'bini'
export type LetterVisibility = 'public' | 'private'

export const LETTER_STATUSES = ['pending', 'approved', 'rejected'] as const
export type LetterStatus = typeof LETTER_STATUSES[number]

export interface LetterSubmitPayload {
  recipient: LetterRecipient
  tourStop: string
  senderName?: string
  senderEmail?: string
  body: string
  design: LetterDesign
  visibility: LetterVisibility
}

export interface LetterAssetOption {
  id: string
  label: string
  preview?: string
}
