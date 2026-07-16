import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'
import { schema } from '#auth/schema'

export const letter = sqliteTable('letter', {
  id: text().primaryKey().$default(() => nanoid()).notNull(),
  recipient: text().notNull(), // maloi, jhoanna, bini
  senderName: text().default('Anonymous').notNull(),
  senderEmail: text(), // optional, contact only, never displayed
  body: text().notNull(),
  design: text({ mode: 'json' }).notNull(), // { background, font, envelope, seal, music, stickers: [{ id, x, y, rotation, scale }] } — options are asset files, not DB rows
  visibility: text().notNull(), // public, private — set at submit, immutable (same reasoning as donation.display)
  status: text().default('pending').notNull(), // pending, approved, rejected
  adminNotes: text(), // internal only
  reviewedBy: text().references(() => schema?.user.id),
  featuredOn: integer({ mode: 'timestamp_ms' }), // date it appears in the daily feed; null = not yet picked
  createdAt: integer({ mode: 'timestamp_ms' })
    .$default(() => new Date())
    .notNull(),
  updatedAt: integer({ mode: 'timestamp_ms' })
    .$default(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
}, t => [
  index('letter_feed_idx').on(t.recipient, t.featuredOn), // mailbox daily-feed query
])
