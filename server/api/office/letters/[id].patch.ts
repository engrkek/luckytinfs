import { letter } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { user } from '#auth/schema'
import { letterDesignSchema } from '#shared/letters/schema'
import { LETTER_STATUSES } from '#shared/letters/types'

const patchSchema = z.object({
  status: z.enum(LETTER_STATUSES).optional(),
  senderName: z.string().trim().min(1).optional(),
  body: z.string().trim().min(1).optional(),
  visibility: z.enum(['public', 'private']).optional(),
  design: letterDesignSchema.optional(),
  adminNotes: z.string().trim().optional(),
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  }

  const { status, senderName, body, visibility, design, adminNotes } = await readValidatedBody(event, patchSchema.parse)
  const { user: sessionUser } = await requireUserSession(event)

  const [updated] = await db.update(letter)
    .set({
      ...(status !== undefined ? { status, reviewedBy: sessionUser.id } : {}),
      ...(senderName !== undefined ? { senderName } : {}),
      ...(body !== undefined ? { body } : {}),
      ...(visibility !== undefined ? { visibility } : {}),
      ...(design !== undefined ? { design } : {}),
      ...(adminNotes !== undefined ? { adminNotes } : {}),
    })
    .where(eq(letter.id, id))
    .returning()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Letter not found' })
  }

  // Resolve reviewer name for the client (may be prior reviewer if only notes changed)
  let reviewer: { id: string, name: string } | null = null
  if (updated.reviewedBy) {
    if (updated.reviewedBy === sessionUser.id && sessionUser.name) {
      reviewer = { id: sessionUser.id, name: sessionUser.name }
    }
    else {
      const [row] = await db
        .select({ id: user.id, name: user.name })
        .from(user)
        .where(eq(user.id, updated.reviewedBy))
        .limit(1)
      if (row)
        reviewer = row
    }
  }

  return {
    letter: {
      ...updated,
      reviewer,
    },
  }
})
