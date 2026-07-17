import type { PublicLetter } from '#shared/letters/public'
import type { LetterDesign, LetterRecipient } from '#shared/letters/types'
import { letter } from '@nuxthub/db/schema'
import { and, desc, eq, isNotNull } from 'drizzle-orm'
import { DEMO_LETTERS, isLetterRecipient } from '#shared/letters/public'

function startOfUtcDay(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

function endOfUtcDay(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999))
}

function toPublic(row: {
  id: string
  recipient: string
  senderName: string
  body: string
  design: unknown
  featuredOn: Date | null
  createdAt: Date
}): PublicLetter {
  return {
    id: row.id,
    recipient: row.recipient as LetterRecipient,
    senderName: row.senderName,
    body: row.body,
    design: row.design as LetterDesign,
    featuredOn: row.featuredOn ? row.featuredOn.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const recipientRaw = typeof query.recipient === 'string' ? query.recipient : ''
  const demo = query.demo === '1' || query.demo === 'true'
  const limit = Math.min(Number(query.limit) || 12, 30)

  if (recipientRaw && !isLetterRecipient(recipientRaw)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid recipient' })
  }

  const recipient = recipientRaw ? recipientRaw as LetterRecipient : null

  // Always allow explicit demo mode for design / empty envs
  if (demo) {
    const list = recipient
      ? DEMO_LETTERS.filter(l => l.recipient === recipient)
      : DEMO_LETTERS
    return { letters: list.slice(0, limit), source: 'demo' as const }
  }

  try {
    const dayStart = startOfUtcDay()
    const dayEnd = endOfUtcDay()

    // Prefer today's featured public letters
    const featured = await db
      .select({
        id: letter.id,
        recipient: letter.recipient,
        senderName: letter.senderName,
        body: letter.body,
        design: letter.design,
        featuredOn: letter.featuredOn,
        createdAt: letter.createdAt,
      })
      .from(letter)
      .where(and(
        eq(letter.status, 'approved'),
        eq(letter.visibility, 'public'),
        isNotNull(letter.featuredOn),
        ...(recipient ? [eq(letter.recipient, recipient)] : []),
      ))
      .orderBy(desc(letter.featuredOn))
      .limit(limit)

    const todays = featured.filter((row) => {
      if (!row.featuredOn)
        return false
      const t = row.featuredOn.getTime()
      return t >= dayStart.getTime() && t <= dayEnd.getTime()
    })

    const pool = todays.length ? todays : featured

    if (pool.length) {
      return {
        letters: pool.map(toPublic),
        source: todays.length ? 'featured' as const : 'archive' as const,
      }
    }
  }
  catch {
    // fall through to demo
  }

  const list = recipient
    ? DEMO_LETTERS.filter(l => l.recipient === recipient)
    : DEMO_LETTERS

  return { letters: list.slice(0, limit), source: 'demo' as const }
})
