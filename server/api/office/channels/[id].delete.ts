import { channel, donation } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  }

  await requireUserSession(event, { user: { role: ['admin'] } })

  const [linked] = await db.select({ id: donation.id }).from(donation).where(eq(donation.channelId, id)).limit(1)
  if (linked) {
    throw createError({ statusCode: 409, statusMessage: 'Cannot delete a wallet with existing donations.' })
  }

  const [deleted] = await db.delete(channel).where(eq(channel.id, id)).returning()
  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Wallet not found' })
  }

  return { success: true }
})
