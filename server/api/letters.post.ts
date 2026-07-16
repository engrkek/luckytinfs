import { letter } from '@nuxthub/db/schema'
import { z } from 'zod'

// ponytail: option ids validated as capped strings for now — tighten to enums
// once the editor's asset constants exist (shared/ dir), so assets stay files not DB rows
const optionId = z.string().min(1).max(50)

const bodySchema = z.object({
  recipient: z.enum(['maloi', 'jhoanna', 'bini']),
  senderName: z.string().trim().max(50).optional(),
  senderEmail: z.email().optional(),
  body: z.string().trim().min(1).max(5000),
  design: z.object({
    background: optionId,
    font: optionId,
    envelope: optionId,
    seal: optionId,
    music: optionId.optional(),
    stickers: z.array(z.object({
      id: optionId,
      x: z.number(),
      y: z.number(),
      rotation: z.number(),
      scale: z.number().positive().max(10),
    })).max(20).default([]),
  }),
  visibility: z.enum(['public', 'private']),
})

export default defineEventHandler(async (event) => {
  const data = await readValidatedBody(event, bodySchema.parse)

  const [created] = await db.insert(letter).values({
    ...data,
    senderName: data.senderName || undefined, // empty string → column default 'Anonymous'
  }).returning({ id: letter.id })

  return created
})
