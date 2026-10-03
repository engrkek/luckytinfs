import { donation, donor, expense } from '@nuxthub/db/schema'
import { desc, eq } from 'drizzle-orm'

function donorLabel(row: { name: string, handle: string }, display: string) {
  const handle = `@${row.handle.replace(/^@/, '')}`
  if (display === 'handle_only')
    return { label: handle }
  if (display === 'name_only')
    return { label: row.name }
  if (display === 'anon')
    return { label: 'Anonymous' }
  return { label: row.name, handle }
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

  const expenseRows = await db
    .select({ id: expense.id, amount: expense.amount, createdAt: expense.spentAt, title: expense.title, isPublic: expense.isPublic })
    .from(expense)
    .orderBy(desc(expense.spentAt))

  const sum = (rows: { amount: number }[]) => rows.reduce((total, r) => total + r.amount, 0)

  return {
    // Hidden expenses are left out of the rows but still counted, so the total stays honest
    totals: { donations: sum(donationRows), expenses: sum(expenseRows) },
    donations: donationRows.map(r => ({ id: r.id, amount: r.amount, createdAt: r.createdAt, ...donorLabel(r, r.display) })),
    expenses: expenseRows.filter(r => r.isPublic).map(r => ({ id: r.id, amount: r.amount, createdAt: r.createdAt, label: r.title })),
  }
})
