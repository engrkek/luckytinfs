import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'
import { schema } from '#auth/schema'

// One row per person, upserted by email when a donation form is submitted.
// Identity lives here so cumulative tier progress survives across donations.
export const donor = sqliteTable('donor', {
  id: text().primaryKey().$default(() => nanoid()).notNull(),
  userId: text().references(() => schema?.user.id), // set if they later log in
  email: text().unique().notNull(),
  handle: text().notNull(), // social handle (or name/url if facebook), if not reachable by email
  social: text().notNull(), // e.g. x/twitter, instagram, facebook, tiktok, reddit, threads
  name: text().default('Anonymous').notNull(), // anon if left blank; latest form submission wins
  createdAt: integer({ mode: 'timestamp_ms' })
    .$default(() => new Date())
    .notNull(),
  updatedAt: integer({ mode: 'timestamp_ms' })
    .$default(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
})
