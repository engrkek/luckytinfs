import { tier } from '@nuxthub/db/schema'
import { z } from 'zod'

const postSchema = z.object({
  campaignId: z.string().min(1),
  name: z.string().trim().min(1),
  minAmount: z.number().int().positive(),
  items: z.array(z.string()).min(1),
  imageUrl: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  await requireUserSession(event, { user: { role: ['admin'] } })
  const data = await readValidatedBody(event, postSchema.parse)

  const [created] = await db.insert(tier).values(data).returning()

  return created
})
