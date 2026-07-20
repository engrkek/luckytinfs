import type { LetterStatus } from '#shared/letters/types'
import { letter } from '@nuxthub/db/schema'
import { desc, eq } from 'drizzle-orm'
import { user } from '#auth/schema'
import { LETTER_STATUSES } from '#shared/letters/types'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const query = getQuery(event)
  const statusRaw = typeof query.status === 'string' ? query.status : ''

  if (statusRaw && !LETTER_STATUSES.includes(statusRaw as LetterStatus)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid status' })
  }

  const rows = await db
    .select({
      id: letter.id,
      recipient: letter.recipient,
      tourStop: letter.tourStop,
      senderName: letter.senderName,
      body: letter.body,
      design: letter.design,
      visibility: letter.visibility,
      status: letter.status,
      adminNotes: letter.adminNotes,
      reviewedBy: letter.reviewedBy,
      createdAt: letter.createdAt,
      updatedAt: letter.updatedAt,
      reviewerName: user.name,
    })
    .from(letter)
    .leftJoin(user, eq(letter.reviewedBy, user.id))
    .where(statusRaw ? eq(letter.status, statusRaw) : undefined)
    .orderBy(desc(letter.createdAt))

  return {
    letters: rows.map(({ reviewerName, ...row }) => ({
      ...row,
      reviewer: row.reviewedBy && reviewerName
        ? { id: row.reviewedBy, name: reviewerName }
        : null,
    })),
  }
})
