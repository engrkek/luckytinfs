import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'
import { schema } from '#auth/schema'

export const event = sqliteTable('event', {
  id: text().primaryKey().$default(() => nanoid()).notNull(),
  name: text().notNull(),
  description: text(),
  venue: text(),
  date: integer({ mode: 'timestamp_ms' }).notNull(),
  capacity: integer(),
  fee: integer(), // in cents
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
