import { customAlphabet } from 'nanoid'

/** Registration lifecycle, in the order declared: pay → verify, or drop out */
export const RSVP_STATUSES = {
  pending_payment: { label: 'Pending payment', color: 'warning' }, // registered, no proof of payment yet
  for_review: { label: 'For review', color: 'info' }, // payment submitted, needs verification
  confirmed: { label: 'Confirmed', color: 'success' }, // payment verified, slot secured
  cancelled: { label: 'Cancelled', color: 'neutral' }, // withdrew or refunded
  rejected: { label: 'Invalid', color: 'error' }, // invalid payment, duplicate, spam
} as const

export type RsvpStatus = keyof typeof RSVP_STATUSES
export const RSVP_STATUS_VALUES = Object.keys(RSVP_STATUSES) as [RsvpStatus, ...RsvpStatus[]]
export const RSVP_STATUS_ITEMS = Object.entries(RSVP_STATUSES).map(([value, { label }]) => ({ value, label }))

/** Falls back to the raw stored value for statuses outside this list */
export function rsvpStatus(status: string) {
  return RSVP_STATUSES[status as RsvpStatus] ?? { label: status, color: 'neutral' as const }
}

/** A full Reg ID typed by hand, e.g. LTFI-TO0 (imported) or LTFI-7KQM */
export const REG_ID_PATTERN = /^[A-Z0-9]+(?:-[A-Z0-9]+)*$/

/** Per-event Reg ID prefix, e.g. LTFI → LTFI-7KQM. Empty = no prefix */
export const REG_PREFIX_PATTERN = /^[A-Z0-9]{0,6}$/

// No 0/O/1/I/L so it reads cleanly aloud and on screen at the door.
// ponytail: 31^4 ≈ 920k codes per prefix; the (event_id, reg_id) unique index rejects the rare
// collision (~1 in 3k at 300 registrations) — add a retry on insert if public sign-ups go high-volume
const regCode = customAlphabet('23456789ABCDEFGHJKMNPQRSTUVWXYZ', 4)

export function generateRegId(prefix?: string | null) {
  return prefix ? `${prefix}-${regCode()}` : regCode()
}
