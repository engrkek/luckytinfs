import { z } from 'zod'
import { LETTER_LIMITS, LETTER_OPTION_IDS } from './assets'
import { TOUR_STOP_IDS } from './tour'
import { isYouTubeLink, normalizeYouTubeMusic } from './youtube'

export const letterDesignSchema = z.object({
  format: z.enum(['letter', 'postcard']).default('letter'),
  background: z.enum(LETTER_OPTION_IDS.backgrounds),
  font: z.enum(LETTER_OPTION_IDS.fonts),
  envelope: z.enum(LETTER_OPTION_IDS.envelopes),
  seal: z.enum(LETTER_OPTION_IDS.seals),
  /** YouTube watch URL — omit or empty for no soundtrack */
  music: z.string().trim().max(LETTER_LIMITS.musicUrlMax).optional(),
  /** Blob pathname from /api/letters/photo — trust boundary: shape-checked so it can't point outside the postcards prefix */
  photo: z.string().regex(/^postcards\/[\w.-]+$/).max(200).optional(),
  stickers: z.array(z.object({
    id: z.enum(LETTER_OPTION_IDS.stickers),
    x: z.number(),
    y: z.number(),
    rotation: z.number(),
    scale: z.number().positive().max(10),
  })).max(LETTER_LIMITS.stickersMax).default([]),
}).superRefine((design, ctx) => {
  if (design.format === 'postcard' && !design.photo) {
    ctx.addIssue({
      code: 'custom',
      path: ['photo'],
      message: 'A postcard needs a photo on the front',
    })
  }
  const music = design.music?.trim()
  if (!music)
    return
  if (!isYouTubeLink(music)) {
    ctx.addIssue({
      code: 'custom',
      path: ['music'],
      message: 'Music must be a valid YouTube link (youtube.com or youtu.be)',
    })
  }
}).transform((design) => {
  const music = normalizeYouTubeMusic(design.music)
  return {
    ...design,
    music,
  }
})

export const letterSubmitSchema = z.object({
  recipient: z.enum(['maloi', 'jhoanna', 'bini']),
  tourStop: z.enum(TOUR_STOP_IDS),
  senderName: z.string().trim().max(LETTER_LIMITS.senderNameMax).optional(),
  senderEmail: z.union([z.email(), z.literal('')]).optional(),
  body: z.string().trim().min(1).max(LETTER_LIMITS.bodyMax),
  design: letterDesignSchema,
  visibility: z.enum(['public', 'private']),
}).superRefine((input, ctx) => {
  if (input.design.format === 'postcard' && input.body.length > LETTER_LIMITS.postcardBodyMax) {
    ctx.addIssue({
      code: 'custom',
      path: ['body'],
      message: `Postcards fit up to ${LETTER_LIMITS.postcardBodyMax} characters`,
    })
  }
})

export type LetterSubmitInput = z.infer<typeof letterSubmitSchema>
