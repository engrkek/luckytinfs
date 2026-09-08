export default defineEventHandler(async () => {
  return await db.query.channel.findMany()
})
