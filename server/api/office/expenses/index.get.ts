import { campaign, channel, donation, event, eventRsvp, expense } from '@nuxthub/db/schema'
import { desc, eq, sql } from 'drizzle-orm'
import { user } from '#auth/schema'

export default defineEventHandler(async (h3) => {
  await requireUserSession(h3, { user: { role: ['admin'] } })

  const [expenses, donationsIn, rsvpsIn, expensesOut] = await Promise.all([
    db
      .select({
        id: expense.id,
        title: expense.title,
        amount: expense.amount,
        spentAt: expense.spentAt,
        campaignId: expense.campaignId,
        campaignTitle: campaign.title,
        eventId: expense.eventId,
        eventName: event.name,
        channelId: expense.channelId,
        channelLabel: sql<string | null>`coalesce(${channel.nickname}, ${channel.type})`,
        receiptUrl: expense.receiptUrl,
        notes: expense.notes,
        isPublic: expense.isPublic,
        createdByName: user.name,
      })
      .from(expense)
      .leftJoin(campaign, eq(campaign.id, expense.campaignId))
      .leftJoin(event, eq(event.id, expense.eventId))
      .leftJoin(channel, eq(channel.id, expense.channelId))
      .leftJoin(user, eq(user.id, expense.createdBy))
      .orderBy(desc(expense.spentAt)),
    db.select({ channelId: donation.channelId, total: sql<number>`sum(${donation.amount})` })
      .from(donation)
      .where(eq(donation.status, 'approved'))
      .groupBy(donation.channelId),
    db.select({ channelId: eventRsvp.channelId, total: sql<number>`sum(${eventRsvp.regFee})` })
      .from(eventRsvp)
      .where(eq(eventRsvp.status, 'confirmed'))
      .groupBy(eventRsvp.channelId),
    db.select({ channelId: expense.channelId, total: sql<number>`sum(${expense.amount})` })
      .from(expense)
      .groupBy(expense.channelId),
  ])

  // Per-wallet ledger. Income only lands in wallets (donations and fees are never cash);
  // key '' is cash, which only ever has money going out.
  // ponytail: sums everything ever recorded; add a date range if the office wants per-period reports
  const balances: Record<string, { in: number, out: number }> = { '': { in: 0, out: 0 } }
  const add = (id: string | null, field: 'in' | 'out', total: number) => {
    if (field === 'in' && !id)
      return // RSVP imports without a wallet: can't attribute to one
    const row = (balances[id ?? ''] ??= { in: 0, out: 0 })
    row[field] += Number(total) || 0
  }
  donationsIn.forEach(r => add(r.channelId, 'in', r.total))
  rsvpsIn.forEach(r => add(r.channelId, 'in', r.total))
  expensesOut.forEach(r => add(r.channelId, 'out', r.total))

  return { expenses, balances }
})
