import { eventRsvp } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { generateRegId, RSVP_STATUS_VALUES } from '#shared/events'

const postSchema = z.object({
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

  const [created] = await db.insert(eventRsvp).values({ ...data, eventId: id, regId: generateRegId(existingEvent.regPrefix) }).returning()

  return created
})
