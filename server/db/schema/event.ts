import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'
import { schema } from '#auth/schema'

export const event = sqliteTable('event', {
  id: text().primaryKey().$default(() => nanoid()).notNull(),
  name: text().notNull().unique(),
  slug: text().notNull().unique(),
  description: text(),
  venue: text(),
  date: integer({ mode: 'timestamp_ms' }).notNull(),
  capacity: integer(),
  fee: integer(), // in cents
  regPrefix: text(), // Reg ID prefix, e.g. LTFI → LTFI-7KQM; see REG_PREFIX_PATTERN
  isOpen: integer({ mode: 'boolean' }).default(true).notNull(), // whether registration/RSVP is open
  details: text({ mode: 'json' }), // freeform extra fields, e.g. { requirements, contactPerson }
  createdBy: text().references(() => schema?.user.id),
  updatedBy: text().references(() => schema?.user.id),
  createdAt: integer({ mode: 'timestamp_ms' })
    .$default(() => new Date())
    .notNull(),
  updatedAt: integer({ mode: 'timestamp_ms' })
    .$default(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
})
