import { donation, donor, expense } from '@nuxthub/db/schema'
import { desc, eq } from 'drizzle-orm'

function donorLabel(row: { name: string, handle: string }, display: string) {
  const handle = `@${row.handle.replace(/^@/, '')}`
  if (display === 'handle_only')
    return handle
  if (display === 'name_only')
    return row.name
  if (display === 'anon')
    return 'Anonymous'
  return `${row.name} (${handle})`
}

export default defineEventHandler(async () => {
  const donationRows = await db
    .select({
      id: donation.id,
      amount: donation.amount,
      createdAt: donation.createdAt,
      display: donation.display,
      name: donor.name,
      handle: donor.handle,
    })
    .from(donation)
    .innerJoin(donor, eq(donor.id, donation.donorId))
    .where(eq(donation.status, 'approved'))
    .orderBy(desc(donation.createdAt))
    .limit(50)

  const expenseRows = await db
    .select({ id: expense.id, amount: expense.amount, createdAt: expense.createdAt, title: expense.title })
    .from(expense)
    .orderBy(desc(expense.createdAt))
    .limit(50)

  return {
    donations: donationRows.map(r => ({ id: r.id, amount: r.amount, createdAt: r.createdAt, label: donorLabel(r, r.display) })),
    expenses: expenseRows.map(r => ({ id: r.id, amount: r.amount, createdAt: r.createdAt, label: r.title })),
  }
})
