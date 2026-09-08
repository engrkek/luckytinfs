import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'

// On frontend, we'll call it "project"
export const campaign = sqliteTable('campaign', {
  id: text().primaryKey().$default(() => nanoid()).notNull(),
  title: text().notNull(),
  description: text(),
  slug: text(), // slugified title
  startDate: text().notNull(),
  endDate: text(), // blank if doesn't expire
  goal: integer(), // fundraising target in cents; blank = no goal
  status: text().default('open').notNull(), // open, closed — closed campaigns no longer accept new donations
  imageUrls: text({ mode: 'json' }).$type<string[]>(),
  createdAt: integer({ mode: 'timestamp_ms' })
    .$default(() => new Date())
    .notNull(),
  updatedAt: integer({ mode: 'timestamp_ms' })
    .$default(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
})
