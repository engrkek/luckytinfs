import { donation, donor } from '@nuxthub/db/schema'
import { z } from 'zod'
import { DONATION_STATUSES } from '#shared/donations'

const postSchema = z.object({
  campaignId: z.string().nullable().optional(),
  amount: z.number().int().positive(),
  channelId: z.string().min(1),
  refNo: z.string().trim().optional(),
  proofUrl: z.string().optional(),
  status: z.enum(DONATION_STATUSES).default('approved'),
  display: z.enum(['both', 'handle_only', 'name_only', 'anon']),
  donorNotes: z.string().trim().optional(),
  adminNotes: z.string().trim().optional(),
  donor: z.object({
    email: z.email(),
    name: z.string().trim().optional(),
    handle: z.string().trim().min(1),
    social: z.string().trim().min(1),
  }),
}).refine(data => (data.display !== 'both' && data.display !== 'name_only') || !!data.donor.name?.trim(), {
  message: 'Name is required for this credit option',
  path: ['donor', 'name'],
})

export default defineEventHandler(async (event) => {
  const { user: sessionUser } = await requireUserSession(event)
  const data = await readValidatedBody(event, postSchema.parse)

  // Same upsert-by-email as the public form so manual entries reuse existing donors
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
    campaignId: data.campaignId ?? null,
    display: data.display,
    amount: data.amount,
    channelId: data.channelId,
    refNo: data.refNo,
    proofUrl: data.proofUrl,
    status: data.status,
    donorNotes: data.donorNotes,
    adminNotes: data.adminNotes,
    reviewedBy: sessionUser.id,
  }).returning({ id: donation.id })

  return created
})
