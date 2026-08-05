import { eq } from 'drizzle-orm'
import { z } from 'zod'

export default defineEventHandler(async (ev) => {
  await requireUserSession(ev, {
    user: { role: ['admin', 'moderator'] },
  })
  const { id } = await getValidatedRouterParams(ev, z.object({
    id: z.string().trim(),
  }).parse)

  const event = await db.query.event.findFirst({ where: eq(schema.event.id, id) })

  return event
})
