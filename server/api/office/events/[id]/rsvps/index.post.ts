import { eventRsvp } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { generateRegId, REG_ID_PATTERN, RSVP_STATUS_VALUES } from '#shared/events'

const postSchema = z.object({
  // Optional: keep an ID issued elsewhere (e.g. the old Supabase form); generated when omitted
  regId: z.string().trim().toUpperCase().max(20).regex(REG_ID_PATTERN).optional(),
  fullName: z.string().min(1),
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
  await requireUserSession(event, { user: { role: ['admin'] } })
  const { id } = await getValidatedRouterParams(event, z.object({
    id: z.string().trim(),
  }).parse)
  const data = await readValidatedBody(event, postSchema.parse)

  const [existingEvent] = await db.select({ regPrefix: schema.event.regPrefix }).from(schema.event).where(eq(schema.event.id, id)).limit(1)
  if (!existingEvent) {
    throw createError({ statusCode: 404, statusMessage: 'Event not found' })
  }

  if (data.regId)
    await assertRegIdFree(id, data.regId)

  const [created] = await db.insert(eventRsvp).values({ ...data, eventId: id, regId: data.regId ?? generateRegId(existingEvent.regPrefix) }).returning()

  return created
})
