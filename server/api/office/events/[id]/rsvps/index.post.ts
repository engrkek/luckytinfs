import { eventRsvp } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const postSchema = z.object({
  fullName: z.string().min(1),
  nickname: z.string().optional(),
  email: z.email().optional(),
  socialPlatform: z.string().optional(),
  socialHandle: z.string().optional(),
  regFee: z.number().int().nonnegative().optional(),
  refNo: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['for_review', 'approved', 'confirmed', 'invalid']).optional(),
})

export default defineEventHandler(async (event) => {
  await requireUserSession(event, { user: { role: ['admin'] } })
  const { id } = await getValidatedRouterParams(event, z.object({
    id: z.string().trim(),
  }).parse)
  const data = await readValidatedBody(event, postSchema.parse)

  const [existingEvent] = await db.select({ id: schema.event.id }).from(schema.event).where(eq(schema.event.id, id)).limit(1)
  if (!existingEvent) {
    throw createError({ statusCode: 404, statusMessage: 'Event not found' })
  }

  const [created] = await db.insert(eventRsvp).values({ ...data, eventId: id }).returning()

  return created
})
