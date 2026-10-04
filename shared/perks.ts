/** Couriers a donor can choose on the perks form */
export const COURIERS = ['J&T Express', 'LBC', 'Flash Express', 'Lalamove'] as const

/** submitted (details in, fee not quoted) → awaiting_payment (fee emailed) → for_review (donor paid) → paid → shipped */
export const PERK_STATUSES = ['submitted', 'awaiting_payment', 'for_review', 'paid', 'shipped'] as const
export type PerkStatus = typeof PERK_STATUSES[number]

export const PERK_STATUS_LABELS: Record<PerkStatus, string> = {
  submitted: 'Needs fee',
  awaiting_payment: 'Awaiting payment',
  for_review: 'For review',
  paid: 'Paid',
  shipped: 'Shipped',
}

/** Every tier the donor's approved campaign total (cents) reaches, lowest first */
export function earnedTiers<T extends { minAmount: number }>(tiers: T[], total: number): T[] {
  return tiers.filter(t => t.minAmount <= total).sort((a, b) => a.minAmount - b.minAmount)
}

/** Which email an office status change sends the donor, if any. Shared so the office can confirm before saving. */
export function perkUpdateEmail(before: string, after: string): 'paid' | 'shipped' | 'rejected' | null {
  if (before === after)
    return null
  if (after === 'paid' || after === 'shipped')
    return after
  // sending a payment back from review = the proof or reference didn't check out
  return before === 'for_review' && after === 'awaiting_payment' ? 'rejected' : null
}
