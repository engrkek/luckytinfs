import { fulfillment, tier } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  }

  await requireUserSession(event, { user: { role: ['admin'] } })

  const [linked] = await db.select({ id: fulfillment.id }).from(fulfillment).where(eq(fulfillment.tierId, id)).limit(1)
  if (linked) {
    throw createError({ statusCode: 409, statusMessage: 'Cannot delete a tier with fulfilled donors.' })
  }

  const [deleted] = await db.delete(tier).where(eq(tier.id, id)).returning()
  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Tier not found' })
  }

  return { success: true }
})
