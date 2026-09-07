import { campaign, channel, donation, donor } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const postSchema = z.object({
  campaignId: z.string().optional(),
  amount: z.number().int().positive(),
  channelId: z.string().min(1),
  refNo: z.string().min(1),
  proofUrl: z.string().optional(),
  display: z.enum(['both', 'handle_only', 'name_only', 'anon']),
  donorNotes: z.string().optional(),
  donor: z.object({
    email: z.email(),
    name: z.string().optional(),
    handle: z.string().min(1),
    social: z.string().min(1),
  }),
}).refine(data => (data.display !== 'both' && data.display !== 'name_only') || !!data.donor.name?.trim(), {
  message: 'Name is required for this credit option',
  path: ['donor', 'name'],
})

export default defineEventHandler(async (event) => {
  const data = await readValidatedBody(event, postSchema.parse)

  if (data.campaignId) {
    const [existingCampaign] = await db.select({ id: campaign.id }).from(campaign).where(eq(campaign.id, data.campaignId)).limit(1)
    if (!existingCampaign) {
      throw createError({ statusCode: 404, statusMessage: 'Campaign not found' })
    }
  }

  const [existingChannel] = await db.select({ id: channel.id }).from(channel).where(eq(channel.id, data.channelId)).limit(1)
  if (!existingChannel) {
    throw createError({ statusCode: 404, statusMessage: 'Payment channel not found' })
  }

  // Upserted by email; latest submission wins on name/handle/social
  const [donorRow] = await db.insert(donor).values({
    email: data.donor.email,
    name: data.donor.name || 'Anonymous',
    handle: data.donor.handle,
    social: data.donor.social,
  }).onConflictDoUpdate({
    target: donor.email,
    set: {
      name: data.donor.name || 'Anonymous',
      handle: data.donor.handle,
      social: data.donor.social,
    },
  }).returning({ id: donor.id })

  const [created] = await db.insert(donation).values({
    donorId: donorRow.id,
    campaignId: data.campaignId,
    display: data.display,
    amount: data.amount,
    channelId: data.channelId,
    refNo: data.refNo,
    proofUrl: data.proofUrl,
    donorNotes: data.donorNotes,
  }).returning({ id: donation.id })

  return created
})
