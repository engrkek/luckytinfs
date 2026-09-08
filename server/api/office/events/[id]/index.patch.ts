import { event as eventTable } from '@nuxthub/db/schema'
import { and, eq, ne } from 'drizzle-orm'
import { z } from 'zod'

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  venue: z.string().optional(),
  date: z.coerce.date().optional(),
  capacity: z.number().int().positive().optional(),
  fee: z.number().int().nonnegative().optional(),
  isOpen: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  }

  const { user } = await requireUserSession(event, { user: { role: ['admin'] } })
  const data = await readValidatedBody(event, patchSchema.parse)

  if (data.name !== undefined) {
    const [existing] = await db
      .select({ id: eventTable.id })
      .from(eventTable)
      .where(and(eq(eventTable.name, data.name), ne(eventTable.id, id)))
      .limit(1)

    if (existing) {
      throw createError({
        statusCode: 409,
        statusMessage: `An event named "${data.name}" already exists.`,
      })
    }
  }

  const [updated] = await db.update(eventTable)
    .set({ ...data, updatedBy: user.id })
    .where(eq(eventTable.id, id))
    .returning()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Event not found' })
  }

  return updated
})
