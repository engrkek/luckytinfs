import { campaign } from '@nuxthub/db/schema'
import { and, eq, ne } from 'drizzle-orm'
import { z } from 'zod'

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  goal: z.number().int().positive().nullable().optional(),
  status: z.enum(['open', 'closed']).optional(),
  imageUrls: z.array(z.string()).optional(),
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  }

  await requireUserSession(event, { user: { role: ['admin'] } })
  const { title, startDate, endDate, ...rest } = await readValidatedBody(event, patchSchema.parse)

  if (title !== undefined) {
    const [existing] = await db
      .select({ id: campaign.id })
      .from(campaign)
      .where(and(eq(campaign.title, title), ne(campaign.id, id)))
      .limit(1)

    if (existing) {
      throw createError({
        statusCode: 409,
        statusMessage: `A project titled "${title}" already exists.`,
      })
    }
  }

  const [updated] = await db.update(campaign)
    .set({
      ...rest,
      ...(title !== undefined ? { title, slug: slugify(title) } : {}),
      ...(startDate !== undefined ? { startDate: startDate.toISOString() } : {}),
      ...(endDate !== undefined ? { endDate: endDate.toISOString() } : {}),
    })
    .where(eq(campaign.id, id))
    .returning()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  }

  return updated
})
