import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'
import { schema } from '#auth/schema'
import { campaign } from './campaign'
import { category } from './category'
import { channel } from './channel'
import { supplier } from './supplier'

export const expense = sqliteTable('expense', {
  id: text().primaryKey().$default(() => nanoid()).notNull(),
  campaignId: text().references(() => campaign.id).notNull(),
  title: text().notNull(),
  description: text(),
  categoryId: text().references(() => category.id).notNull(),
  supplierId: text().references(() => supplier.id),
  amount: integer().notNull(), // in cents
  method: text().notNull(), // e.g. cash, channel
  channelId: text().references(() => channel.id), // where funds come from
  fee: integer(), // cahsout or transfer fee, in cents
  paymentUrl: text(), // proof of payment
  receiptUrl: text(), // invoice
  notes: text(), // not sure if shown publicly
  createdBy: text().references(() => schema?.user.id).notNull(),
  updatedBy: text().references(() => schema?.user.id),
  createdAt: integer({ mode: 'timestamp_ms' })
    .$default(() => new Date())
    .notNull(),
  updatedAt: integer({ mode: 'timestamp_ms' })
    .$default(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
})
