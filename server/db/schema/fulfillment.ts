import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'
import { schema } from '#auth/schema'
import { donor } from './donor'
import { tier } from './tier'

// A row means this donor received this tier's items.
// Earned tiers are computed (sum of verified donations per campaign vs tier
// minAmount); owed = earned minus fulfilled.
export const fulfillment = sqliteTable('fulfillment', {
  id: text().primaryKey().$default(() => nanoid()).notNull(),
  donorId: text().references(() => donor.id).notNull(),
  tierId: text().references(() => tier.id).notNull(),
  fulfilledBy: text().references(() => schema?.user.id).notNull(),
  notes: text(),
  createdAt: integer({ mode: 'timestamp_ms' })
    .$default(() => new Date())
    .notNull(),
}, t => [
  unique().on(t.donorId, t.tierId), // two admins at a busy handout table can't fulfill the same tier twice
])
