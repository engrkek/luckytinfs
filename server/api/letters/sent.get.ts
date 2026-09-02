import type { TourStopId } from '#shared/letters/tour'
import type { LetterRecipient } from '#shared/letters/types'
import { letter } from '@nuxthub/db/schema'
import { and, eq, ne } from 'drizzle-orm'

/**
 * Occupied mailbox×stop slots for this browser's sender cookie.
 * Used so the editor can warn before someone writes a letter they can't send.
 */
export default defineEventHandler(async (event) => {
  const senderId = getCookie(event, SENDER_COOKIE)
  if (!senderId) {
    return { slots: [] as { recipient: LetterRecipient, tourStop: TourStopId }[] }
  }

  const rows = await db
    .select({
      recipient: letter.recipient,
      tourStop: letter.tourStop,
    })
    .from(letter)
    .where(and(
      eq(letter.senderId, senderId),
      ne(letter.status, 'rejected'),
    ))

  return {
    slots: rows.map(r => ({
      recipient: r.recipient as LetterRecipient,
      tourStop: r.tourStop as TourStopId,
    })),
  }
})
