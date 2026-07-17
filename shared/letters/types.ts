export interface LetterStickerPlacement {
  id: string
  x: number
  y: number
  rotation: number
  scale: number
}

export interface LetterDesign {
  background: string
  font: string
  envelope: string
  seal: string
  music?: string
  stickers: LetterStickerPlacement[]
}

export type LetterRecipient = 'maloi' | 'jhoanna' | 'bini'
export type LetterVisibility = 'public' | 'private'

export interface LetterSubmitPayload {
  recipient: LetterRecipient
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
