import { eventRsvp } from '@nuxthub/db/schema'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

/** Sends one registration email; the final confirmations also confirm the slot. */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event, { user: { role: ['admin'] } })
  const { id, rsvpId } = await getValidatedRouterParams(event, z.object({
    id: z.string().trim(),
    rsvpId: z.string().trim(),
  }).parse)
  const { kind } = await readValidatedBody(event, z.object({ kind: z.enum(EVENT_EMAILS) }).parse)

  const [ev, rsvp] = await Promise.all([
    db.query.event.findFirst({ where: eq(schema.event.id, id) }),
    db.query.eventRsvp.findFirst({ where: and(eq(eventRsvp.id, rsvpId), eq(eventRsvp.eventId, id)) }),
  ])
  if (!ev || !rsvp)
    throw createError({ statusCode: 404, statusMessage: 'Registration not found' })

  await sendRsvpEmail(kind, ev, rsvp, getRequestURL(event).origin, user.id)
  return { success: true }
})
