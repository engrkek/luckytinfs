import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'

// Expense category
export const category = sqliteTable('category', {
  id: text().primaryKey().$default(() => nanoid()).notNull(),
  name: text().notNull(),
  icon: text().notNull(),
  color: text().notNull(),
  createdAt: integer({ mode: 'timestamp_ms' })
    .$default(() => new Date())
    .notNull(),
  updatedAt: integer({ mode: 'timestamp_ms' })
    .$default(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
})
