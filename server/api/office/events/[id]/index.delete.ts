import { eventRsvp, event as eventTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  }

  await requireUserSession(event, { user: { role: ['admin'] } })

  const [rsvp] = await db.select({ id: eventRsvp.id }).from(eventRsvp).where(eq(eventRsvp.eventId, id)).limit(1)
  if (rsvp) {
    throw createError({ statusCode: 409, statusMessage: 'Cannot delete an event with existing RSVPs.' })
  }

  const [deleted] = await db.delete(eventTable).where(eq(eventTable.id, id)).returning()
  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Event not found' })
  }

  return { success: true }
})
