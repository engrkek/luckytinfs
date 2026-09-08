import { channel } from '@nuxthub/db/schema'
import { z } from 'zod'

const postSchema = z.object({
  type: z.string().trim().min(1),
  nickname: z.string().trim().optional(),
  accountName: z.string().trim().min(1),
  accountIdentifier: z.string().trim().min(1),
  qrUrl: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  await requireUserSession(event, { user: { role: ['admin'] } })
  const data = await readValidatedBody(event, postSchema.parse)

  const [created] = await db.insert(channel).values(data).returning()

  return created
})
