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
