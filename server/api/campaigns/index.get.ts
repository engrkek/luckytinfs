export default defineEventHandler(async () => {
  return await db.query.campaign.findMany()
})
