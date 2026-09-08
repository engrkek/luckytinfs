export default defineEventHandler(async (event) => {
  await requireUserSession(event, { user: { role: ['admin'] } })

  const projects = await db.query.campaign.findMany()

  return projects
})
