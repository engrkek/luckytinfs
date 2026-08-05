import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'
import { schema } from '#auth/schema'
import { channel } from './channel'
import { donor } from './donor'
import { event } from './event'
import { eventTier } from './event_tier'

// One row means this donor registered for this event. Payment is tracked
// here directly (not via the donation table) since a ticket fee is a fixed
// one-time charge, not a cumulative campaign donation.
export const eventRegistration = sqliteTable('event_registration', {
  id: text().primaryKey().$default(() => nanoid()).notNull(),
  eventId: text().references(() => event.id).notNull(),
  donorId: text().references(() => donor.id).notNull(),
  tierId: text().references(() => eventTier.id), // null if free registration
  guestCount: integer().default(1).notNull(), // total people covered, including the registrant
  amount: integer(), // in cents; actual amount charged (tier.price * guestCount), null if free
  channelId: text().references(() => channel.id), // where payment was sent
  proofUrl: text(), // payment screenshot
  status: text().default('pending').notNull(), // pending, approved, invalid
  reviewedBy: text().references(() => schema?.user.id),
  checkedInAt: integer({ mode: 'timestamp_ms' }), // set at door check-in
  notes: text(),
  createdAt: integer({ mode: 'timestamp_ms' })
    .$default(() => new Date())
    .notNull(),
  updatedAt: integer({ mode: 'timestamp_ms' })
    .$default(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
}, t => [
  unique().on(t.eventId, t.donorId), // one registration per donor per event
])
