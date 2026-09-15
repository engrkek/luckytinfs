export const DONATION_STATUSES = ['pending', 'approved', 'invalid'] as const
export type DonationStatus = typeof DONATION_STATUSES[number]

export function fullAccountName(c: { accountName: string, accountLastName?: string | null }) {
  return [c.accountName, c.accountLastName].filter(Boolean).join(' ')
}
