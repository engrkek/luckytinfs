import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'
import { campaign } from './campaign'

export const event = sqliteTable('event', {
  id: text().primaryKey().$default(() => nanoid()).notNull(),
  campaignId: text().references(() => campaign.id), // null = no fundraiser attached
  title: text().notNull(),
  description: text(),
  venue: text(),
  maxGuests: integer(), // null = unlimited; registration closes once sum(event_registration.guestCount) reaches this
  startDate: text().notNull(),
  startTime: text().notNull(),
  endDate: text(), // blank if single-day
  endTime: text(),
  imageUrls: text({ mode: 'json' }).$type<string[]>(),
  createdAt: integer({ mode: 'timestamp_ms' })
    .$default(() => new Date())
    .notNull(),
  updatedAt: integer({ mode: 'timestamp_ms' })
    .$default(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
})
