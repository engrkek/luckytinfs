import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'
import { campaign } from './campaign'

// Donation perk tier: earned when a donor's cumulative approved donations
// to the campaign reach minAmount. Always computed, never stored.
export const tier = sqliteTable('tier', {
  id: text().primaryKey().$default(() => nanoid()).notNull(),
  campaignId: text().references(() => campaign.id).notNull(),
  name: text().notNull(), // e.g. "Tier 1"
  minAmount: integer().notNull(), // in cents
  items: text({ mode: 'json' }).$type<string[]>().notNull(), // e.g. ["Unseen photocard", "Handbanner"]
  imageUrl: text(),
  createdAt: integer({ mode: 'timestamp_ms' })
    .$default(() => new Date())
    .notNull(),
  updatedAt: integer({ mode: 'timestamp_ms' })
    .$default(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
})
