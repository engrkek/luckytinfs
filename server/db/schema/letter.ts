import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'
import { schema } from '#auth/schema'
import { TOUR_STOPS } from '#shared/letters/tour'

export const letter = sqliteTable('letter', {
  id: text().primaryKey().$default(() => nanoid()).notNull(),
  recipient: text().notNull(), // maloi, jhoanna, bini
  tourStop: text().default(TOUR_STOPS[0].id).notNull(), // assigned at submit via resolveTourStop()
  senderName: text().default('Anonymous').notNull(),
  senderEmail: text(), // optional, contact only, never displayed
  body: text().notNull(),
  design: text({ mode: 'json' }).notNull(), // { background, font, envelope, seal, music?: YouTube URL, stickers: [{ id, x, y, rotation, scale }] }
  visibility: text().notNull(), // public, private — set at submit, immutable (same reasoning as donation.display)
  status: text().default('pending').notNull(), // pending, approved, rejected
  adminNotes: text(), // internal only
  reviewedBy: text().references(() => schema?.user.id),
  createdAt: integer({ mode: 'timestamp_ms' })
    .$default(() => new Date())
    .notNull(),
  updatedAt: integer({ mode: 'timestamp_ms' })
    .$default(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
}, t => [
  index('letter_feed_idx').on(t.recipient, t.tourStop), // per-stop public feed
  index('letter_stop_idx').on(t.tourStop), // per-stop member feed
])
