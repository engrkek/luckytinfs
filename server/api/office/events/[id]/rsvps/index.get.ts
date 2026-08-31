import { eq } from 'drizzle-orm'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  await requireUserSession(event, { user: { role: ['admin'] } })
  const { id } = await getValidatedRouterParams(event, z.object({
    id: z.string().trim(),
  }).parse)

  const rsvps = await db.query.eventRsvp.findMany({ where: eq(schema.eventRsvp.eventId, id) })

  return rsvps
})
