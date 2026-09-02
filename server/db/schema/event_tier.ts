import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'
import { event } from './event'

// Event ticket tier: a fixed-price registration option, independent of
// campaign donation tiers. Unlike tier.minAmount (a cumulative threshold),
// price here is charged in full per registration.
export const eventTier = sqliteTable('event_tier', {
  id: text().primaryKey().$default(() => nanoid()).notNull(),
  eventId: text().references(() => event.id).notNull(),
  name: text().notNull(), // e.g. "Tier 1"
  price: integer().notNull(), // in cents
  items: text({ mode: 'json' }).$type<string[]>().notNull(),
  imageUrl: text(),
  createdAt: integer({ mode: 'timestamp_ms' })
    .$default(() => new Date())
    .notNull(),
  updatedAt: integer({ mode: 'timestamp_ms' })
    .$default(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
})
