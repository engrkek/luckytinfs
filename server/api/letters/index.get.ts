import type { PublicLetter } from '#shared/letters/public'
import type { LetterDesign, LetterRecipient } from '#shared/letters/types'
import { letter } from '@nuxthub/db/schema'
import { and, desc, eq } from 'drizzle-orm'
import { isLetterRecipient } from '#shared/letters/public'
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
  const limit = Math.min(Number(query.limit) || 12, 30)

  if (recipientRaw && !isLetterRecipient(recipientRaw)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid recipient' })
  }

  const recipient = recipientRaw ? recipientRaw as LetterRecipient : null

  // Member's own printed QR key — unlocks private letters for that recipient only.
  // Recipients with no key configured are unlocked by link alone (no QR was handed out).
  const keyRaw = typeof query.key === 'string' ? query.key : ''
  const memberKeys = useRuntimeConfig(event).memberMailboxKeys as Record<string, string>
  const requiredKey = recipient ? memberKeys[recipient] : undefined
  const isMember = Boolean(recipient) && (!requiredKey || keyRaw === requiredKey)

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

  return {
    letters: pool.map(toPublic),
    source: current.length ? 'stop' as const : 'archive' as const,
    unlocked: isMember,
  }
})
