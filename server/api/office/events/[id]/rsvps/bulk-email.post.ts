import { eventRsvp } from '@nuxthub/db/schema'
import { and, eq, inArray } from 'drizzle-orm'
import { z } from 'zod'
import { BULK_EMAILS, bulkSkipReason } from '#shared/blockscreening'

/**
 * Sends one email to many registrations, skipping the ineligible (see bulkSkipReason).
 * One failure doesn't stop the rest; each result says what happened.
 */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event, { user: { role: ['admin'] } })
  const { id } = await getValidatedRouterParams(event, z.object({ id: z.string().trim() }).parse)
  const { kind, rsvpIds, resend } = await readValidatedBody(event, z.object({
    kind: z.enum(BULK_EMAILS),
    rsvpIds: z.array(z.string().trim().min(1)).min(1).max(200),
    resend: z.boolean().default(false),
  }).parse)

  const ev = await db.query.event.findFirst({ where: eq(schema.event.id, id) })
  if (!ev)
    throw createError({ statusCode: 404, statusMessage: 'Event not found' })
  const rsvps = await db.query.eventRsvp.findMany({ where: and(eq(eventRsvp.eventId, id), inArray(eventRsvp.id, rsvpIds)) })

  const origin = getRequestURL(event).origin
  const results: { id: string, name: string, result: 'sent' | 'skipped' | 'failed', reason?: string }[] = []

  // ponytail: sequential, fine for a few dozen; batch/queue if an event ever needs hundreds
  for (const r of rsvps) {
    const skip = bulkSkipReason(kind, r, resend)
    if (skip) {
      results.push({ id: r.id, name: r.fullName, result: 'skipped', reason: skip })
      continue
    }
    try {
      await sendRsvpEmail(kind, ev, r, origin, user.id)
      results.push({ id: r.id, name: r.fullName, result: 'sent' })
    }
    catch (err) {
      const e = err as { statusMessage?: string, message?: string }
      results.push({ id: r.id, name: r.fullName, result: 'failed', reason: e.statusMessage ?? e.message ?? 'unknown error' })
    }
  }

  return results
})
