import { relations } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'
import { schema } from '#auth/schema'
import { campaign } from './campaign'
import { channel } from './channel'
import { donor } from './donor'

export const donation = sqliteTable('donation', {
  id: text().primaryKey().$default(() => nanoid()).notNull(),
  donorId: text().references(() => donor.id).notNull(), // upserted by email on form submit
  campaignId: text().references(() => campaign.id), // null = "wherever it's most needed"
  display: text().notNull(), // handle_only, name_only, both, anon — per donation, so going public later never unmasks an old anonymous donation
  amount: integer().notNull(), // stored as cents
  channelId: text().references(() => channel.id).notNull(),
  proofUrl: text(), // file upload url
  status: text().default('pending').notNull(), // pending, approved, invalid
  donorNotes: text(), // idk if it should be shown publicly
  adminNotes: text(), // internal only
  reviewedBy: text().references(() => schema?.user.id),
  createdAt: integer({ mode: 'timestamp_ms' })
    .$default(() => new Date())
    .notNull(),
  updatedAt: integer({ mode: 'timestamp_ms' })
    .$default(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
})

export const donationRelations = relations(donation, ({ one }) => ({
  donor: one(donor, {
    fields: [donation.donorId],
    references: [donor.id],
  }),
  channel: one(channel, {
    fields: [donation.channelId],
    references: [channel.id],
  }),
  campaign: one(campaign, {
    fields: [donation.campaignId],
    references: [campaign.id],
  }),
}))
