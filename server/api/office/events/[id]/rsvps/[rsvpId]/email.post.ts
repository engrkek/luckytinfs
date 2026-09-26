import { eventRsvp } from '@nuxthub/db/schema'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { MAIL_ADDRESSES } from '#shared/mail'

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
  if (!rsvp.email)
    throw createError({ statusCode: 400, statusMessage: `${rsvp.fullName} has no email address.` })

  const { template, props } = eventEmail(kind, ev, rsvp, getRequestURL(event).origin)
  await sendEmail({ to: rsvp.email, from: mailFrom(MAIL_ADDRESSES.events), ...await renderEmail(template, props) })

  // Only after a successful send, so a failed email is never recorded as sent or confirms anyone
  const confirms = kind === 'confirmation' || kind === 'sponsor'
  await db.update(eventRsvp)
    .set({
      emailsSent: { ...rsvp.emailsSent, [kind]: Date.now() },
      ...(confirms ? { status: 'confirmed', reviewedBy: user.id } : {}),
      // The sponsor thank-you is for sponsors who won't attend: free their seat
      ...(kind === 'sponsor' ? { attending: false } : {}),
    })
    .where(eq(eventRsvp.id, rsvp.id))

  return { success: true }
})
