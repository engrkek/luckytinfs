import { relations } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'
import { donation } from './donation'

// Donation / Payment channel
export const channel = sqliteTable('channel', {
  id: text().primaryKey().$default(() => nanoid()).notNull(),
  type: text().notNull(), // e.g. gcash, maya, gotyme
  nickname: text(),
  accountName: text().notNull(),
  accountIdentifier: text().notNull(), // e.g. phone number, account number, email
  qrUrl: text(), // file upload url
  createdAt: integer({ mode: 'timestamp_ms' })
    .$default(() => new Date())
    .notNull(),
  updatedAt: integer({ mode: 'timestamp_ms' })
    .$default(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
})

export const channelRelations = relations(channel, ({ many }) => ({
  donations: many(donation),
}))
