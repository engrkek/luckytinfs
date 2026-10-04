import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'
import { schema } from '#auth/schema'
import { campaign } from './campaign'
import { channel } from './channel'
import { donor } from './donor'

// Where to ship the perks a donor earned in a campaign, plus the shipping fee they pay for it.
// Like event_rsvp, the fee has its own payment tracking and is not a donation.
// Which tier it covers is computed (earnedTier: the highest one reached), never stored.
export const perkClaim = sqliteTable('perk_claim', {
  id: text().primaryKey().$default(() => nanoid()).notNull(),
  donorId: text().references(() => donor.id).notNull(),
  campaignId: text().references(() => campaign.id).notNull(),
  recipientName: text().notNull(),
  phone: text().notNull(),
  address: text().notNull(),
  courier: text().notNull(), // one of COURIERS in shared/perks.ts
  size: text(), // only when an earned tier has sizes
  notes: text(),
  shippingFee: integer(), // in cents; null until the office quotes it
  channelId: text().references(() => channel.id),
  refNo: text(),
  proofUrl: text(),
  status: text().default('submitted').notNull(), // PERK_STATUSES in shared/perks.ts
  trackingNo: text(),
  paymentEmailSentAt: integer({ mode: 'timestamp_ms' }), // last successful shipping fee email; null = never sent
  reviewedBy: text().references(() => schema?.user.id),
  createdAt: integer({ mode: 'timestamp_ms' })
    .$default(() => new Date())
    .notNull(),
  updatedAt: integer({ mode: 'timestamp_ms' })
    .$default(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
}, t => [
  // ponytail: one shipment per donor per campaign. A donor who reaches a higher tier after
  // shipping needs a second one: drop this and key the public link by claim id.
  unique().on(t.donorId, t.campaignId),
])
