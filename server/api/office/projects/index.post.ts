import { campaign } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const postSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  goal: z.number().int().positive().optional(),
  imageUrls: z.array(z.string()).optional(),
})

export default defineEventHandler(async (event) => {
  await requireUserSession(event, { user: { role: ['admin'] } })
  const data = await readValidatedBody(event, postSchema.parse)

  const [existing] = await db
    .select({ id: campaign.id })
    .from(campaign)
    .where(eq(campaign.title, data.title))
    .limit(1)

  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: `A project titled "${data.title}" already exists.`,
    })
  }

  const [created] = await db.insert(campaign).values({
    ...data,
    startDate: data.startDate.toISOString(),
    endDate: data.endDate?.toISOString(),
    slug: slugify(data.title),
  }).returning()

  return created
})
