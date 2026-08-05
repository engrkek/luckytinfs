import { db } from '@nuxthub/db'

export default defineEventHandler(async (event) => {
  await requireUserSession(event, {
    user: { role: ['admin', 'moderator'] },
  })

  const events = await db.query.event.findMany()

  return events
})
