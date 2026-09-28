import { donation, tier } from '@nuxthub/db/schema'
import { and, eq, lte, sum } from 'drizzle-orm'
import { z } from 'zod'
import { php } from '#shared/blockscreening'
import { newlyUnlockedTier, walletType } from '#shared/donations'
import { MAIL_ADDRESSES } from '#shared/mail'

const date = new Intl.DateTimeFormat('en-PH', { dateStyle: 'long', timeZone: 'Asia/Manila' })

/** Emails the donor a receipt for an approved donation, with any tier it unlocked. Records when, only after a successful send. */
export default defineEventHandler(async (event) => {
  await requireUserSession(event, { user: { role: ['admin'] } })
  const { id } = await getValidatedRouterParams(event, z.object({ id: z.string().trim() }).parse)

  const d = await db.query.donation.findFirst({
    where: eq(donation.id, id),
    with: { donor: true, channel: true, campaign: true },
  })
  if (!d)
    throw createError({ statusCode: 404, statusMessage: 'Donation not found' })
  if (d.status !== 'approved')
    throw createError({ statusCode: 400, statusMessage: 'Approve the donation before sending a receipt.' })

  let total: number | null = null
  let unlocked: { name: string, items: string[] } | null = null
  if (d.campaignId) {
    // Total as of this donation (not today), so resending an old receipt doesn't credit later donations
    const [[row], tiers] = await Promise.all([
      db.select({ total: sum(donation.amount).mapWith(Number) }).from(donation).where(and(
        eq(donation.donorId, d.donorId),
        eq(donation.campaignId, d.campaignId),
        eq(donation.status, 'approved'),
        lte(donation.createdAt, d.createdAt),
      )),
      db.select().from(tier).where(eq(tier.campaignId, d.campaignId)),
    ])
    total = row?.total ?? d.amount
    unlocked = newlyUnlockedTier(tiers, total, d.amount)
  }

  await sendEmail({
    to: d.donor.email,
    from: mailFrom(MAIL_ADDRESSES.donations),
    ...await renderEmail('DonationConfirmation', {
      name: d.donor.name === 'Anonymous' ? d.donor.handle : d.donor.name,
      amount: php(d.amount),
      project: d.campaign?.title,
      channel: walletType(d.channel.type).label,
      refNo: d.refNo,
      date: date.format(d.createdAt),
      total: total != null ? php(total) : null,
      tier: unlocked && { name: unlocked.name, items: unlocked.items },
    }),
  })
  const [{ receiptSentAt }] = await db.update(donation)
    .set({ receiptSentAt: new Date() })
    .where(eq(donation.id, d.id))
    .returning({ receiptSentAt: donation.receiptSentAt })
  return { receiptSentAt }
})
