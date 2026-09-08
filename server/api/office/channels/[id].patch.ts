import { channel } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const patchSchema = z.object({
  type: z.string().trim().min(1).optional(),
  nickname: z.string().trim().optional(),
  accountName: z.string().trim().min(1).optional(),
  accountIdentifier: z.string().trim().min(1).optional(),
  qrUrl: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  }

  await requireUserSession(event, { user: { role: ['admin'] } })
  const data = await readValidatedBody(event, patchSchema.parse)

  const [updated] = await db.update(channel)
    .set(data)
    .where(eq(channel.id, id))
    .returning()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Wallet not found' })
  }

  return updated
})
