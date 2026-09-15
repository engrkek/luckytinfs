import { channel } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async () => {
  return await db.query.channel.findMany({ where: eq(channel.isEnabled, true) })
})
