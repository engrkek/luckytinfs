import { eventRsvp } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const patchSchema = z.object({
  fullName: z.string().min(1).optional(),
  nickname: z.string().optional(),
  email: z.email().optional(),
  contactNumber: z.string().optional(),
  socialPlatform: z.string().optional(),
  socialHandle: z.string().optional(),
  regFee: z.number().int().nonnegative().optional(),
  refNo: z.string().optional(),
  receiptUrl: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['for_review', 'approved', 'confirmed', 'invalid']).optional(),
})

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event, { user: { role: ['admin'] } })
  const { rsvpId } = await getValidatedRouterParams(event, z.object({
    rsvpId: z.string().trim(),
  }).parse)
  const data = await readValidatedBody(event, patchSchema.parse)

  const [updated] = await db.update(eventRsvp)
    .set({ ...data, reviewedBy: user.id })
    .where(eq(eventRsvp.id, rsvpId))
    .returning()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Registration not found' })
  }

  return updated
})
