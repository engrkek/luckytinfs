import { eventRsvp } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { RSVP_STATUS_VALUES } from '#shared/events'

const patchSchema = z.object({
  fullName: z.string().min(1).optional(),
  nickname: z.string().optional(),
  email: z.email().optional(),
  contactNumber: z.string().optional(),
  socialPlatform: z.string().optional(),
  socialHandle: z.string().optional(),
  regFee: z.number().int().nonnegative().optional(),
  refNo: z.string().optional(),
  sponsoredKids: z.number().int().min(0).max(20).optional(),
  companions: z.array(z.object({ name: z.string().trim().min(1), relationship: z.string().trim() })).max(20).optional(),
  channelId: z.string().min(1).nullable().optional(),
  receiptUrl: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(RSVP_STATUS_VALUES).optional(),
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
