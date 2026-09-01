import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'
import { schema } from '#auth/schema'
import { event } from './event'

export const eventRsvp = sqliteTable('event_rsvp', {
  id: text().primaryKey().$default(() => nanoid()).notNull(),
  eventId: text().references(() => event.id).notNull(),
  fullName: text().notNull(),
  nickname: text(),
  email: text(),
  contactNumber: text(),
  socialPlatform: text(),
  socialHandle: text(),
  companions: text({ mode: 'json' }).$type<{ name: string, relationship: string }[]>(), // json for future fields per companion
  regFee: integer(), // in cents
  refNo: text(), // payment reference number
  receiptUrl: text(),
  status: text().default('for_review').notNull(), // for_review, approved, confirmed, invalid
  notes: text(), // internal only
  reviewedBy: text().references(() => schema?.user.id),
  createdAt: integer({ mode: 'timestamp_ms' })
    .$default(() => new Date())
    .notNull(),
  updatedAt: integer({ mode: 'timestamp_ms' })
    .$default(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
}, t => [
  index('event_rsvp_event_idx').on(t.eventId),
])
