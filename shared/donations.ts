export const DONATION_STATUSES = ['pending', 'approved', 'invalid'] as const
export type DonationStatus = typeof DONATION_STATUSES[number]

export function fullAccountName(c: { accountName: string, accountLastName?: string | null }) {
  return [c.accountName, c.accountLastName].filter(Boolean).join(' ')
}

/**
 * Payment channel types. `channel.type` is free text in the schema, so this is
 * the display/select source of truth, not a constraint — unknown values still render.
 */
export const WALLET_TYPES = {
  gcash: { label: 'GCash', class: 'bg-blue-500 text-blue-50' },
  maya: { label: 'Maya', class: 'bg-green-50 text-green-500' },
  gotyme: { label: 'GoTyme', class: 'bg-cyan-200 text-neutral-900' },
  bank: { label: 'Bank', class: 'bg-elevated text-toned' },
  other: { label: 'Other', class: 'bg-elevated text-toned' },
} as const

export type WalletType = keyof typeof WALLET_TYPES

/** Select options, in the order declared above */
export const WALLET_TYPE_ITEMS = Object.entries(WALLET_TYPES)
  .map(([value, { label }]) => ({ value, label }))

/** Falls back to the raw stored value for types added outside this list */
export function walletType(type: string) {
  return WALLET_TYPES[type as WalletType] ?? { label: type, class: 'bg-elevated text-toned capitalize' }
}
