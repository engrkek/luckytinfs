import { letter } from '@nuxthub/db/schema'
import { letterSubmitSchema } from '#shared/letters/schema'
import { resolveTourStop } from '#shared/letters/tour'

export default defineEventHandler(async (event) => {
  const data = await readValidatedBody(event, letterSubmitSchema.parse)

  const [created] = await db.insert(letter).values({
    recipient: data.recipient,
    tourStop: resolveTourStop(data.tourStop),
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
