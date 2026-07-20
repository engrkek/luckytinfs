import { letter } from '@nuxthub/db/schema'
import { and, eq, ne } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { LETTER_RECIPIENTS } from '#shared/letters/assets'
import { letterSubmitSchema } from '#shared/letters/schema'
import { resolveTourStop } from '#shared/letters/tour'

const SENDER_COOKIE = 'luckytin-sender'

export default defineEventHandler(async (event) => {
  const data = await readValidatedBody(event, letterSubmitSchema.parse)

  // Anonymous per-browser id — no accounts, so this is honest-user enforcement
  let senderId = getCookie(event, SENDER_COOKIE)
  if (!senderId) {
    senderId = nanoid()
    setCookie(event, SENDER_COOKIE, senderId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: !import.meta.dev,
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    })
  }

  const tourStop = resolveTourStop(data.tourStop)

  // 1 letter per mailbox per stop; a rejected letter frees its slot
  const [already] = await db
    .select({ id: letter.id })
    .from(letter)
    .where(and(
      eq(letter.senderId, senderId),
      eq(letter.recipient, data.recipient),
      eq(letter.tourStop, tourStop),
      ne(letter.status, 'rejected'),
    ))
    .limit(1)

  if (already) {
    const label = LETTER_RECIPIENTS.find(r => r.id === data.recipient)?.label ?? data.recipient
    throw createError({
      statusCode: 409,
      message: `You've already sent ${label} a letter for this tour stop — it's one letter per mailbox, per stop. Pick another mailbox or wait for the next stop.`,
    })
  }

  const [created] = await db.insert(letter).values({
    recipient: data.recipient,
    tourStop,
    senderId,
    senderName: data.senderName || undefined, // empty → column default 'Anonymous'
    senderEmail: data.senderEmail || undefined,
    body: data.body,
    design: {
      format: data.design.format,
      background: data.design.background,
      font: data.design.font,
      envelope: data.design.envelope,
      seal: data.design.seal,
      ...(data.design.music ? { music: data.design.music } : {}),
      ...(data.design.format === 'postcard' && data.design.photo ? { photo: data.design.photo } : {}),
      stickers: data.design.stickers ?? [],
    },
    visibility: data.visibility,
  }).returning({ id: letter.id })

  return created
})
