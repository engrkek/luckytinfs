import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'
import { schema } from '#auth/schema'
import { channel } from './channel'
import { event } from './event'

export const eventRsvp = sqliteTable('event_rsvp', {
  id: text().primaryKey().$default(() => nanoid()).notNull(),
  eventId: text().references(() => event.id).notNull(),
  regId: text().notNull(), // human-readable code for event day, unique per event; see generateRegId
  fullName: text().notNull(),
  nickname: text(),
  email: text(),
  contactNumber: text(),
  socialPlatform: text(),
  socialHandle: text(),
  sponsoredKids: integer().default(0).notNull(), // charity kids this registrant sponsors to attend
  attending: integer({ mode: 'boolean' }).default(true).notNull(), // false = sponsor-only, takes no seat; see rsvpSeats
  companions: text({ mode: 'json' }).$type<{ name: string, relationship: string }[]>(), // json for future fields per companion
  food: text({ mode: 'json' }).$type<{ name: string, choice: string }[]>(), // one meal pick per attendee (registrant + companions), from the public food form
  emailsSent: text({ mode: 'json' }).$type<Partial<Record<string, number>>>(), // EventEmail kind → last sent (ms), set by the office email endpoint
  regFee: integer(), // in cents
  refNo: text(), // payment reference number
  channelId: text().references(() => channel.id), // wallet the fee was paid to; null for imports that only name the method
  receiptUrl: text(),
  status: text().default('for_review').notNull(), // RsvpStatus in shared/events.ts
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
  uniqueIndex('event_rsvp_reg_id_idx').on(t.eventId, t.regId),
])
