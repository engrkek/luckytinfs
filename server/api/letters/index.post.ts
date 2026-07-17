import { letter } from '@nuxthub/db/schema'
import { letterSubmitSchema } from '#shared/letters/schema'

export default defineEventHandler(async (event) => {
  const data = await readValidatedBody(event, letterSubmitSchema.parse)

  const [created] = await db.insert(letter).values({
    recipient: data.recipient,
    senderName: data.senderName || undefined, // empty → column default 'Anonymous'
    senderEmail: data.senderEmail || undefined,
    body: data.body,
    design: {
      background: data.design.background,
      font: data.design.font,
      envelope: data.design.envelope,
      seal: data.design.seal,
      ...(data.design.music ? { music: data.design.music } : {}),
      stickers: data.design.stickers ?? [],
    },
    visibility: data.visibility,
  }).returning({ id: letter.id })

  return created
})
