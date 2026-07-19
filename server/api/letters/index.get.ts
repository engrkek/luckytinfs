import type { PublicLetter } from '#shared/letters/public'
import type { LetterDesign, LetterRecipient } from '#shared/letters/types'
import { letter } from '@nuxthub/db/schema'
import { and, desc, eq } from 'drizzle-orm'
import { DEMO_LETTERS, isLetterRecipient } from '#shared/letters/public'
import { nextTourStop } from '#shared/letters/tour'

function toPublic(row: {
  id: string
  recipient: string
  tourStop: string
  senderName: string
  body: string
  design: unknown
  createdAt: Date
}): PublicLetter {
  return {
    id: row.id,
    recipient: row.recipient as LetterRecipient,
    tourStop: row.tourStop as PublicLetter['tourStop'],
    senderName: row.senderName,
    body: row.body,
    design: row.design as LetterDesign,
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

  // Member's own printed QR key — unlocks private letters for that recipient only
  const keyRaw = typeof query.key === 'string' ? query.key : ''
  const memberKeys = useRuntimeConfig(event).memberMailboxKeys as Record<string, string>
  const isMember = Boolean(recipient) && keyRaw.length > 0 && keyRaw === memberKeys[recipient!]

  try {
    const fetchApproved = (stop?: string) => db
      .select({
        id: letter.id,
        recipient: letter.recipient,
        tourStop: letter.tourStop,
        senderName: letter.senderName,
        body: letter.body,
        design: letter.design,
        createdAt: letter.createdAt,
      })
      .from(letter)
      .where(and(
        eq(letter.status, 'approved'),
        ...(isMember ? [] : [eq(letter.visibility, 'public')]),
        ...(stop ? [eq(letter.tourStop, stop)] : []),
        ...(recipient ? [eq(letter.recipient, recipient)] : []),
      ))
      .orderBy(desc(letter.createdAt))
      .limit(limit)

    // Current stop's letters first; any approved letters if the stop is empty
    const current = await fetchApproved(nextTourStop().id)
    const pool = current.length ? current : await fetchApproved()

    if (pool.length) {
      return {
        letters: pool.map(toPublic),
        source: current.length ? 'stop' as const : 'archive' as const,
        unlocked: isMember,
      }
    }
  }
  catch {
    // fall through to demo
  }

  const list = recipient
    ? DEMO_LETTERS.filter(l => l.recipient === recipient)
    : DEMO_LETTERS

  return { letters: list.slice(0, limit), source: 'demo' as const, unlocked: isMember }
})
