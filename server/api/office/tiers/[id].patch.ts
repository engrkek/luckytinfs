import { tier } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const patchSchema = z.object({
  name: z.string().trim().min(1).optional(),
  minAmount: z.number().int().positive().optional(),
  items: z.array(z.string()).min(1).optional(),
  imageUrl: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  }

  await requireUserSession(event, { user: { role: ['admin'] } })
  const data = await readValidatedBody(event, patchSchema.parse)

  const [updated] = await db.update(tier)
    .set(data)
    .where(eq(tier.id, id))
    .returning()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Tier not found' })
  }

  return updated
})
