import { eventRsvp } from '@nuxthub/db/schema'
import { and, eq } from 'drizzle-orm'
import { blob } from 'hub:blob'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  await requireUserSession(event, { user: { role: ['admin'] } })
  const { id, rsvpId } = await getValidatedRouterParams(event, z.object({
    id: z.string().trim(),
    rsvpId: z.string().trim(),
  }).parse)

  const [deleted] = await db.delete(eventRsvp)
    .where(and(eq(eventRsvp.id, rsvpId), eq(eventRsvp.eventId, id)))
    .returning()

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Registration not found' })
  }

  // Receipt is stored as `/images/<pathname>`; an orphaned blob is harmless, so don't fail the delete over it
  if (deleted.receiptUrl?.startsWith('/images/'))
    await blob.del(deleted.receiptUrl.slice('/images/'.length)).catch(() => {})

  return { success: true }
})
