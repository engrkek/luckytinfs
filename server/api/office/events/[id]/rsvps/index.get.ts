import { channel, eventRsvp } from '@nuxthub/db/schema'
import { desc, eq, getTableColumns, sql } from 'drizzle-orm'
import { z } from 'zod'
import { user } from '#auth/schema'

export default defineEventHandler(async (event) => {
  await requireUserSession(event, { user: { role: ['admin'] } })
  const { id } = await getValidatedRouterParams(event, z.object({
    id: z.string().trim(),
  }).parse)

  return db
    .select({ ...getTableColumns(eventRsvp), reviewerName: user.name, channelLabel: sql<string | null>`coalesce(nullif(${channel.nickname}, ''), ${channel.type})` })
    .from(eventRsvp)
    .leftJoin(user, eq(user.id, eventRsvp.reviewedBy))
    .leftJoin(channel, eq(channel.id, eventRsvp.channelId))
    .where(eq(eventRsvp.eventId, id))
    .orderBy(desc(eventRsvp.createdAt))
})
