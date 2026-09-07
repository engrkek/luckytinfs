export const DONATION_STATUSES = ['pending', 'approved', 'invalid'] as const
export type DonationStatus = typeof DONATION_STATUSES[number]
