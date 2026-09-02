import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'

export const supplier = sqliteTable('supplier', {
  id: text().primaryKey().$default(() => nanoid()).notNull(),
  name: text().notNull(),
  type: text().notNull(), // e.g. printing, ads, venue
  email: text(),
  contactNo: text(),
  socials: text(),
  notes: text(),
  createdAt: integer({ mode: 'timestamp_ms' })
    .$default(() => new Date())
    .notNull(),
  updatedAt: integer({ mode: 'timestamp_ms' })
    .$default(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
})
