export default defineEventHandler(async (event) => {
  await requireUserSession(event, { user: { role: ['admin'] } })

  const events = await db.query.event.findMany()

  return events
})
