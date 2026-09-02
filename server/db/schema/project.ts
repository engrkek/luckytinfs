import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'
import { campaign } from './campaign'

export const project = sqliteTable('project', {
  id: text().primaryKey().$default(() => nanoid()).notNull(),
  campaignId: text().references(() => campaign.id).notNull(),
  title: text().notNull(),
  description: text(),
  goal: integer().notNull(), // in cents; acts as milestone within campaign
  order: integer().notNull(), // milestone unlock order within campaign
  status: text().default('planned').notNull(), // planned, ongoing, completed, cancelled
  imageUrls: text({ mode: 'json' }).$type<string[]>(),
  createdAt: integer({ mode: 'timestamp_ms' })
    .$default(() => new Date())
    .notNull(),
  updatedAt: integer({ mode: 'timestamp_ms' })
    .$default(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
})
