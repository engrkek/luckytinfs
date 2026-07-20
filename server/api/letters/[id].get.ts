import type { PublicLetter } from '#shared/letters/public'
import type { LetterDesign, LetterRecipient } from '#shared/letters/types'
import { letter } from '@nuxthub/db/schema'
import { and, eq } from 'drizzle-orm'
import { DEMO_LETTERS } from '#shared/letters/public'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  }

  const demo = DEMO_LETTERS.find(l => l.id === id)
  if (demo)
    return { letter: demo, source: 'demo' as const }

  try {
    const [row] = await db
      .select({
        id: letter.id,
        recipient: letter.recipient,
        tourStop: letter.tourStop,
        senderName: letter.senderName,
        body: letter.body,
        design: letter.design,
        createdAt: letter.createdAt,
        visibility: letter.visibility,
        status: letter.status,
      })
      .from(letter)
      .where(and(
        eq(letter.id, id),
        eq(letter.status, 'approved'),
        eq(letter.visibility, 'public'),
      ))
      .limit(1)

    if (!row) {
      throw createError({ statusCode: 404, statusMessage: 'Letter not found' })
    }

    const publicLetter: PublicLetter = {
      id: row.id,
      recipient: row.recipient as LetterRecipient,
      tourStop: row.tourStop as PublicLetter['tourStop'],
      senderName: row.senderName,
      body: row.body,
      design: row.design as LetterDesign,
      createdAt: row.createdAt.toISOString(),
    }

    return { letter: publicLetter, source: 'db' as const }
  }
  catch (e: unknown) {
    const err = e as { statusCode?: number }
    if (err.statusCode)
      throw e
    throw createError({ statusCode: 404, statusMessage: 'Letter not found' })
  }
})
