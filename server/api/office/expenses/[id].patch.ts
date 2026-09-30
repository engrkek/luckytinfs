import { expense } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { expenseSchema } from '#shared/expenses'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  }

  const { user } = await requireUserSession(event, { user: { role: ['admin'] } })
  const data = await readValidatedBody(event, expenseSchema.partial().parse)

  const [updated] = await db.update(expense)
    .set({ ...data, updatedBy: user.id })
    .where(eq(expense.id, id))
    .returning({ id: expense.id })

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Expense not found' })
  }

  return updated
})
