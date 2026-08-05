import type {
  campaign,
  category,
  channel,
  donation,
  donor,
  event,
  eventRegistration,
  eventTier,
  expense,
  fulfillment,
  letter,
  project,
  supplier,
  tier,
  user,
} from '@nuxthub/db/schema'

// Select types (for reading data)
export type User = typeof user.$inferSelect
export type CEvent = typeof event.$inferSelect
export type Campaign = typeof campaign.$inferSelect
export type Category = typeof category.$inferSelect
export type Channel = typeof channel.$inferSelect
export type Donation = typeof donation.$inferSelect
export type Donor = typeof donor.$inferSelect
export type EventRegistration = typeof eventRegistration.$inferSelect
export type EventTier = typeof eventTier.$inferSelect
export type Expense = typeof expense.$inferSelect
export type Fulfillment = typeof fulfillment.$inferSelect
export type Letter = typeof letter.$inferSelect
export type Project = typeof project.$inferSelect
export type Supplier = typeof supplier.$inferSelect
export type Tier = typeof tier.$inferSelect

// Insert types (for creating data)
export type NewUser = typeof user.$inferInsert
export type NewCEvent = typeof event.$inferInsert
export type NewCampaign = typeof campaign.$inferInsert
export type NewCategory = typeof category.$inferInsert
export type NewChannel = typeof channel.$inferInsert
export type NewDonation = typeof donation.$inferInsert
export type NewDonor = typeof donor.$inferInsert
export type NewEventRegistration = typeof eventRegistration.$inferInsert
export type NewEventTier = typeof eventTier.$inferInsert
export type NewExpense = typeof expense.$inferInsert
export type NewFulfillment = typeof fulfillment.$inferInsert
export type NewLetter = typeof letter.$inferInsert
export type NewProject = typeof project.$inferInsert
export type NewSupplier = typeof supplier.$inferInsert
export type NewTier = typeof tier.$inferInsert
