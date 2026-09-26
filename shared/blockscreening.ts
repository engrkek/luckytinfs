import { holdsSeats } from './events'

/** The office event public block screening forms write to: the one with this Reg ID prefix. */
export const BLOCKSCREENING_REG_PREFIX = 'LTFI'

/** ₱1,500 tickets close and the ₱400 SALE ticket opens at this instant (Sep 27, 12:00 AM PHT). */
export const SALE_OPENS_AT = new Date('2026-09-27T00:00:00+08:00')

export function isSaleOpen(now = new Date()) {
  return now >= SALE_OPENS_AT
}

export const TICKETS = {
  sponsor: { label: 'Sponsor a child 🐥', price: 150000, sponsoredKids: 1 },
  sponsor_two: { label: 'Sponsor two children 🐥🐥', price: 150000, sponsoredKids: 2 },
  bring: { label: 'Bring own child 🎒', price: 150000, sponsoredKids: 0 },
  sale: { label: 'SALE ticket 🎟️', price: 40000, sponsoredKids: 0 },
} as const

export type Ticket = keyof typeof TICKETS

export const SALE_INCLUSIONS = ['Bottled water', '2 photocards', 'Custom movie ticket']

/** Every ₱1,500 option sponsors or brings a kid; SALE is solo. Saves a ticket column. */
export function rsvpTicket(r: { sponsoredKids: number, companions?: unknown[] | null }): Ticket {
  if (r.sponsoredKids >= 2)
    return 'sponsor_two'
  if (r.sponsoredKids === 1)
    return 'sponsor'
  return r.companions?.length ? 'bring' : 'sale'
}

// ponytail: placeholder menu, replace with the real options before sending food emails
export const FOOD_OPTIONS = ['Burger', 'Hotdog', 'Popcorn']

/** Food form closes here (Oct 1, 12:00 AM PHT); anyone who hasn't answered gets FOOD_DEFAULT */
export const FOOD_DEADLINE = new Date('2026-10-01T00:00:00+08:00')
export const FOOD_DEADLINE_LABEL = 'October 1, 12:00 AM (PHT)'
export const FOOD_DEFAULT = 'Popcorn'

export function isFoodOpen(now = new Date()) {
  return now < FOOD_DEADLINE
}

export const PAYMENT_DEADLINE = 'within 24 hours of receiving this email'

export function php(cents: number) {
  return `₱${(cents / 100).toLocaleString('en-PH')}`
}

interface EmailRsvp {
  email: string | null
  status: string
  attending: boolean
  sponsoredKids: number
  companions?: unknown[] | null
  emailsSent?: Partial<Record<string, number>> | null
}

/**
 * Why this registration can't get this email, or null if it can. The one rule set:
 * the sheet hides blocked emails, single and bulk sends refuse them.
 */
export function emailBlockReason(kind: 'payment' | 'confirmation' | 'food' | 'sponsor', r: EmailRsvp) {
  if (!holdsSeats(r.status))
    return 'cancelled or invalid'
  switch (kind) {
    case 'payment':
      return r.status === 'pending_payment' ? null : 'already paid'
    case 'food':
      if (rsvpTicket(r) === 'sale')
        return 'SALE ticket, no meal'
      return r.attending ? null : 'sponsor-only, not attending'
    case 'confirmation':
      return r.attending ? null : 'not attending, no pass'
    case 'sponsor':
      // Only for sponsors already marked as not attending, so a stray click can't cost an attendee their seat
      if (!r.sponsoredKids)
        return 'not sponsoring any kids'
      return r.attending ? 'still marked as attending' : null
  }
}

/** Bulk sends only these; the final emails confirm the slot, so they stay one at a time */
export const BULK_EMAILS = ['payment', 'food'] as const

/** Why a bulk send skips this registration, or null to send */
export function bulkSkipReason(kind: typeof BULK_EMAILS[number], r: EmailRsvp, resend: boolean) {
  if (!r.email)
    return 'no email'
  const blocked = emailBlockReason(kind, r)
  if (blocked)
    return blocked
  if (!resend && r.emailsSent?.[kind])
    return 'already sent'
  return null
}
