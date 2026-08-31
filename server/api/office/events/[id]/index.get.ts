import { eq } from 'drizzle-orm'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  await requireUserSession(event, { user: { role: ['admin'] } })
  const { id } = await getValidatedRouterParams(event, z.object({
    id: z.string().trim(),
  }).parse)

  const ev = await db.query.event.findFirst({ where: eq(schema.event.id, id) })

  return ev
})
