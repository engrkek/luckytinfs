import { z } from 'zod'
import { LETTER_LIMITS, LETTER_OPTION_IDS } from './assets'
import { isSpotifyLink, normalizeSpotifyMusic } from './spotify'

export const letterDesignSchema = z.object({
  background: z.enum(LETTER_OPTION_IDS.backgrounds),
  font: z.enum(LETTER_OPTION_IDS.fonts),
  envelope: z.enum(LETTER_OPTION_IDS.envelopes),
  seal: z.enum(LETTER_OPTION_IDS.seals),
  /** Spotify open URL — omit or empty for no soundtrack */
  music: z.string().trim().max(LETTER_LIMITS.musicUrlMax).optional(),
  stickers: z.array(z.object({
    id: z.enum(LETTER_OPTION_IDS.stickers),
    x: z.number(),
    y: z.number(),
    rotation: z.number(),
    scale: z.number().positive().max(10),
  })).max(LETTER_LIMITS.stickersMax).default([]),
}).superRefine((design, ctx) => {
  const music = design.music?.trim()
  if (!music)
    return
  if (!isSpotifyLink(music)) {
    ctx.addIssue({
      code: 'custom',
      path: ['music'],
      message: 'Music must be a valid Spotify link (open.spotify.com)',
    })
  }
}).transform((design) => {
  const music = normalizeSpotifyMusic(design.music)
  return {
    ...design,
    music,
  }
})

export const letterSubmitSchema = z.object({
  recipient: z.enum(['maloi', 'jhoanna', 'bini']),
  senderName: z.string().trim().max(LETTER_LIMITS.senderNameMax).optional(),
  senderEmail: z.union([z.email(), z.literal('')]).optional(),
  body: z.string().trim().min(1).max(LETTER_LIMITS.bodyMax),
  design: letterDesignSchema,
  visibility: z.enum(['public', 'private']),
})

export type LetterSubmitInput = z.infer<typeof letterSubmitSchema>
