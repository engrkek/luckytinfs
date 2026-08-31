import { event as eventTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const postSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  venue: z.string().optional(),
  date: z.coerce.date(),
  capacity: z.number().int().positive().optional(),
  fee: z.number().int().nonnegative().optional(),
})

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event, { user: { role: ['admin'] } })
  const data = await readValidatedBody(event, postSchema.parse)

  const [existing] = await db
    .select({ id: eventTable.id })
    .from(eventTable)
    .where(eq(eventTable.name, data.name))
    .limit(1)

  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: `An event named "${data.name}" already exists.`,
    })
  }

  const [created] = await db.insert(eventTable).values({
    ...data,
    slug: slugify(data.name),
    createdBy: user.id,
    updatedBy: user.id,
  }).returning()

  return created
})
