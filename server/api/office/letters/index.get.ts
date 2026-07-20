import type { LetterStatus } from '#shared/letters/types'
import { letter } from '@nuxthub/db/schema'
import { desc, eq } from 'drizzle-orm'
import { LETTER_STATUSES } from '#shared/letters/types'

export default defineEventHandler(async (event) => {
  requireUserSession(event)
  const query = getQuery(event)
  const statusRaw = typeof query.status === 'string' ? query.status : ''

  if (statusRaw && !LETTER_STATUSES.includes(statusRaw as LetterStatus)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid status' })
  }

  const rows = await db
    .select()
    .from(letter)
    .where(statusRaw ? eq(letter.status, statusRaw) : undefined)
    .orderBy(desc(letter.createdAt))

  return { letters: rows }
})
