import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'
import { schema } from '#auth/schema'
import { campaign } from './campaign'
import { category } from './category'
import { channel } from './channel'
import { event } from './event'
import { supplier } from './supplier'

export const expense = sqliteTable('expense', {
  id: text().primaryKey().$default(() => nanoid()).notNull(),
  campaignId: text().references(() => campaign.id), // project it was spent on; null with eventId null = general/overhead
  eventId: text().references(() => event.id), // event it was spent on
  title: text().notNull(),
  description: text(),
  categoryId: text().references(() => category.id),
  supplierId: text().references(() => supplier.id),
  amount: integer().notNull(), // in cents
  channelId: text().references(() => channel.id), // wallet the money came from; null = cash
  spentAt: integer({ mode: 'timestamp_ms' }) // when it was paid, may be backdated
    .$default(() => new Date())
    .notNull(),
  paymentUrl: text(), // proof of payment
  receiptUrl: text(), // invoice
  notes: text(), // not sure if shown publicly
  isPublic: integer({ mode: 'boolean' }).default(true).notNull(), // false = left off the public report rows, still counted in its total
  createdBy: text().references(() => schema?.user.id).notNull(),
  updatedBy: text().references(() => schema?.user.id),
  createdAt: integer({ mode: 'timestamp_ms' })
    .$default(() => new Date())
    .notNull(),
  updatedAt: integer({ mode: 'timestamp_ms' })
    .$default(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
}, t => [
  index('expense_spent_at_idx').on(t.spentAt),
])
