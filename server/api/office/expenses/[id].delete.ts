import { expense } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  }

  await requireUserSession(event, { user: { role: ['admin'] } })

  const [deleted] = await db.delete(expense).where(eq(expense.id, id)).returning()
  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Expense not found' })
  }

  return { success: true }
})
