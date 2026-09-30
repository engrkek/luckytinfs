import { expense } from '@nuxthub/db/schema'
import { expenseSchema } from '#shared/expenses'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event, { user: { role: ['admin'] } })
  const data = await readValidatedBody(event, expenseSchema.parse)

  const [created] = await db.insert(expense)
    .values({ ...data, createdBy: user.id })
    .returning({ id: expense.id })

  return created
})
