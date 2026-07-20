import type { TourStopId } from './tour'
import type { LetterDesign, LetterRecipient } from './types'

export interface PublicLetter {
  id: string
  recipient: LetterRecipient
  tourStop: TourStopId
  senderName: string
  body: string
  design: LetterDesign
  createdAt: string
}

export function isLetterRecipient(value: string): value is LetterRecipient {
  return value === 'maloi' || value === 'jhoanna' || value === 'bini'
}
