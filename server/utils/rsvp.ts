import { eventRsvp } from '@nuxthub/db/schema'
import { and, eq, ne } from 'drizzle-orm'

/** 409 with the holder's name, instead of a bare unique-index 500 */
export async function assertRegIdFree(eventId: string, regId: string, exceptRsvpId?: string) {
  const [taken] = await db.select({ fullName: eventRsvp.fullName }).from(eventRsvp).where(and(
    eq(eventRsvp.eventId, eventId),
    eq(eventRsvp.regId, regId),
    exceptRsvpId ? ne(eventRsvp.id, exceptRsvpId) : undefined,
  )).limit(1)
  if (taken)
    throw createError({ statusCode: 409, statusMessage: `Reg ID ${regId} is already used by ${taken.fullName}.` })
}
