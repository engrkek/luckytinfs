import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'

export const campaign = sqliteTable('campaign', {
  id: text().primaryKey().$default(() => nanoid()).notNull(),
  title: text().notNull(),
  description: text(),
  startDate: text().notNull(),
  endDate: text(), // blank if doesn't expire
  imageUrls: text({ mode: 'json' }).$type<string[]>(),
  createdAt: integer({ mode: 'timestamp_ms' })
    .$default(() => new Date())
    .notNull(),
  updatedAt: integer({ mode: 'timestamp_ms' })
    .$default(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
})
