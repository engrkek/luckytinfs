import { donation } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  }

  await requireUserSession(event, { user: { role: ['admin'] } })

  const [deleted] = await db.delete(donation).where(eq(donation.id, id)).returning()
  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Donation not found' })
  }

  return { success: true }
})
