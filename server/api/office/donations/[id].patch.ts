import { donation, donor } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { user } from '#auth/schema'
import { DONATION_STATUSES } from '#shared/donations'

const patchSchema = z.object({
  status: z.enum(DONATION_STATUSES).optional(),
  adminNotes: z.string().trim().optional(),
  campaignId: z.string().nullable().optional(),
  amount: z.number().int().positive().optional(),
  channelId: z.string().min(1).optional(),
  refNo: z.string().trim().optional(),
  proofUrl: z.string().optional(),
  display: z.enum(['both', 'handle_only', 'name_only', 'anon']).optional(),
  donorNotes: z.string().trim().optional(),
  donor: z.object({
    name: z.string().trim().optional(),
    handle: z.string().trim().min(1).optional(),
    social: z.string().trim().min(1).optional(),
    email: z.email().optional(),
  }).optional(),
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  }

  const { status, adminNotes, campaignId, amount, channelId, refNo, proofUrl, display, donorNotes, donor: donorPatch } = await readValidatedBody(event, patchSchema.parse)
  const { user: sessionUser } = await requireUserSession(event)

  const [updated] = await db.update(donation)
    .set({
      ...(status !== undefined ? { status, reviewedBy: sessionUser.id } : {}),
      ...(adminNotes !== undefined ? { adminNotes } : {}),
      ...(campaignId !== undefined ? { campaignId } : {}),
      ...(amount !== undefined ? { amount } : {}),
      ...(channelId !== undefined ? { channelId } : {}),
      ...(refNo !== undefined ? { refNo } : {}),
      ...(proofUrl !== undefined ? { proofUrl } : {}),
      ...(display !== undefined ? { display } : {}),
      ...(donorNotes !== undefined ? { donorNotes } : {}),
    })
    .where(eq(donation.id, id))
    .returning()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Donation not found' })
  }

  let donorRow: { id: string, name: string, handle: string, social: string, email: string } | undefined
  if (donorPatch && Object.keys(donorPatch).length > 0) {
    [donorRow] = await db.update(donor)
      .set(donorPatch)
      .where(eq(donor.id, updated.donorId))
      .returning({ id: donor.id, name: donor.name, handle: donor.handle, social: donor.social, email: donor.email })
  }

  // Resolve reviewer name for the client (may be prior reviewer if only notes changed)
  let reviewer: { id: string, name: string } | null = null
  if (updated.reviewedBy) {
    if (updated.reviewedBy === sessionUser.id && sessionUser.name) {
      reviewer = { id: sessionUser.id, name: sessionUser.name }
    }
    else {
      const [row] = await db
        .select({ id: user.id, name: user.name })
        .from(user)
        .where(eq(user.id, updated.reviewedBy))
        .limit(1)
      if (row)
        reviewer = row
    }
  }

  return {
    donation: {
      ...updated,
      reviewer,
      ...(donorRow ? { donor: donorRow } : {}),
    },
  }
})
