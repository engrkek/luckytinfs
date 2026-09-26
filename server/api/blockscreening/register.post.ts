import { eventRsvp } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { isSaleOpen, TICKETS } from '#shared/blockscreening'
import { generateRegId, holdsSeats, rsvpSeats } from '#shared/events'

const registerSchema = z.object({
  fullName: z.string().trim().min(1).max(200),
  nickname: z.string().trim().min(1).max(100),
  email: z.email(),
  mobile: z.string().trim().min(1).max(50),
  primaryPlatform: z.string().trim().min(1).max(50),
  primaryUsername: z.string().trim().min(1).max(300),
  otherPlatform: z.string().trim().max(50).optional(),
  otherUsername: z.string().trim().max(300).optional(),
  ticket: z.enum(Object.keys(TICKETS) as [keyof typeof TICKETS]),
  minorName: z.string().trim().max(200).optional(),
  relationship: z.string().trim().max(100).optional(),
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, registerSchema.parse)

  // ₱1,500 options close the moment SALE opens
  if ((body.ticket === 'sale') !== isSaleOpen())
    throw createError({ statusCode: 400, statusMessage: 'That ticket option is no longer available. Please refresh the page.' })
  if (body.ticket === 'bring' && (!body.minorName || !body.relationship))
    throw createError({ statusCode: 400, statusMessage: 'Minor\'s name and relationship are required.' })

  const ev = await getBlockscreeningEvent()
  if (!ev.isOpen)
    throw createError({ statusCode: 403, statusMessage: 'Registration is closed.' })

  const values = {
    attending: true,
    eventId: ev.id,
    fullName: body.fullName,
    nickname: body.nickname,
    email: body.email,
    contactNumber: body.mobile,
    socialPlatform: body.primaryPlatform,
    socialHandle: body.primaryUsername,
    sponsoredKids: TICKETS[body.ticket].sponsoredKids,
    companions: body.ticket === 'bring' ? [{ name: body.minorName!, relationship: body.relationship! }] : null,
    notes: body.otherPlatform && body.otherUsername ? `Other social: ${body.otherPlatform} ${body.otherUsername}` : null,
    status: 'pending_payment',
  }

  // Capacity is seats, unpaid registrations included, so the cinema can't be oversold.
  // ponytail: read-then-insert, two sign-ups landing in the same instant can overshoot by one; fine at this volume
  if (ev.capacity) {
    const rows = await db.select({ status: eventRsvp.status, attending: eventRsvp.attending, sponsoredKids: eventRsvp.sponsoredKids, companions: eventRsvp.companions })
      .from(eventRsvp)
      .where(eq(eventRsvp.eventId, ev.id))
    const taken = rows.filter(r => holdsSeats(r.status)).reduce((n, r) => n + rsvpSeats(r), 0)
    const needed = rsvpSeats(values)
    if (taken + needed > ev.capacity) {
      throw createError({
        statusCode: 409,
        statusMessage: ev.capacity - taken > 0
          ? `Only ${ev.capacity - taken} seat${ev.capacity - taken === 1 ? '' : 's'} left, and this option needs ${needed}.`
          : 'Sorry, all slots are taken.',
      })
    }
  }

  // (event_id, reg_id) is unique; retry the rare collision with a fresh code
  for (let i = 0; i < 5; i++) {
    const [created] = await db.insert(eventRsvp)
      .values({ ...values, regId: generateRegId(ev.regPrefix) })
      .onConflictDoNothing()
      .returning({ regId: eventRsvp.regId })
    if (created)
      return created
  }
  throw createError({ statusCode: 500, statusMessage: 'Could not assign a Registration ID. Please try again.' })
})
