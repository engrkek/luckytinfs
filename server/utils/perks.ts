import { campaign, donation, donor, perkClaim, tier } from '@nuxthub/db/schema'
import { and, eq, sum } from 'drizzle-orm'
import { z } from 'zod'
import { earnedTier } from '#shared/perks'

/** The public perks link is /perks?donor=&campaign=. Donor ids are unguessable and never public, so the id is the secret. */
export const perkKey = z.object({
  donor: z.string().min(1).max(50),
  campaign: z.string().min(1).max(50),
})

/** The donor, their earned tiers for the campaign and their claim, if any. 404s when there's nothing to claim. */
export async function getPerkContext(donorId: string, campaignId: string) {
  const [donorRow, campaignRow, [approved], tiers, claim] = await Promise.all([
    db.query.donor.findFirst({ where: eq(donor.id, donorId) }),
    db.query.campaign.findFirst({ where: eq(campaign.id, campaignId) }),
    db.select({ total: sum(donation.amount).mapWith(Number) }).from(donation).where(and(
      eq(donation.donorId, donorId),
      eq(donation.campaignId, campaignId),
      eq(donation.status, 'approved'),
    )),
    db.select().from(tier).where(eq(tier.campaignId, campaignId)),
    db.query.perkClaim.findFirst({ where: and(eq(perkClaim.donorId, donorId), eq(perkClaim.campaignId, campaignId)) }),
  ])
  // one tier at most; kept as a list so the page and emails don't care how many
  const top = earnedTier(tiers, approved?.total ?? 0)
  const tiersEarned = top ? [top] : []
  if (!donorRow || !campaignRow || (!tiersEarned.length && !claim))
    throw createError({ statusCode: 404, statusMessage: 'This perks link isn\'t valid, or there are no perks to claim yet.' })

  return {
    donor: donorRow,
    campaign: campaignRow,
    tiers: tiersEarned,
    sizes: [...new Set(tiersEarned.flatMap(t => t.sizes ?? []))],
    claim,
  }
}

export function perksUrl(origin: string, donorId: string, campaignId: string) {
  return `${origin}/perks?${new URLSearchParams({ donor: donorId, campaign: campaignId })}`
}

// ponytail: when each donor was last emailed their perks link, as one KV map keyed "donorId:campaignId".
// There's no claim row to hang it on before they submit. Move to a table if invites need history or grow past a few thousand.
const INVITES_KEY = 'perks:invited'

export async function getPerkInvites() {
  return await kv.getItem<Record<string, number>>(INVITES_KEY) ?? {}
}

export async function recordPerkInvite(donorId: string, campaignId: string) {
  await kv.setItem(INVITES_KEY, { ...await getPerkInvites(), [`${donorId}:${campaignId}`]: Date.now() })
}

/** Donors whose approved donations reach a tier in a campaign but who haven't submitted the perks form. */
export async function getUnclaimedPerks() {
  const [totals, tiers, claims, invites] = await Promise.all([
    db.select({
      donorId: donor.id,
      donorName: donor.name,
      donorHandle: donor.handle,
      donorEmail: donor.email,
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      total: sum(donation.amount).mapWith(Number),
    })
      .from(donation)
      .innerJoin(donor, eq(donor.id, donation.donorId))
      .innerJoin(campaign, eq(campaign.id, donation.campaignId))
      .where(eq(donation.status, 'approved'))
      .groupBy(donor.id, campaign.id),
    db.select().from(tier),
    db.select({ donorId: perkClaim.donorId, campaignId: perkClaim.campaignId }).from(perkClaim),
    getPerkInvites(),
  ])
  const claimed = new Set(claims.map(c => `${c.donorId}:${c.campaignId}`))

  return totals.flatMap((row) => {
    const key = `${row.donorId}:${row.campaignId}`
    const earned = earnedTier(tiers.filter(t => t.campaignId === row.campaignId), row.total)
    if (!earned || claimed.has(key))
      return []
    return [{ ...row, tiers: [{ name: earned.name, items: earned.items }], invitedAt: invites[key] ?? null }]
  })
}
