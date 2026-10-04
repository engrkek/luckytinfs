import { z } from 'zod'
import { MAIL_ADDRESSES } from '#shared/mail'

/**
 * Emails the perks form link to donors who earned a tier but haven't claimed.
 * One failure doesn't stop the rest; each result says what happened.
 */
export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const { items } = await readValidatedBody(event, z.object({
    items: z.array(z.object({ donorId: z.string().min(1), campaignId: z.string().min(1) })).min(1).max(200),
  }).parse)

  // Re-derived here, so a stale office tab can't invite someone who has since claimed
  const wanted = new Set(items.map(i => `${i.donorId}:${i.campaignId}`))
  const unclaimed = (await getUnclaimedPerks()).filter(u => wanted.has(`${u.donorId}:${u.campaignId}`))

  const origin = getRequestURL(event).origin
  const results: { email: string, result: 'sent' | 'failed', reason?: string }[] = []

  // ponytail: sequential, fine for a few dozen; batch/queue if a campaign ever needs hundreds
  for (const u of unclaimed) {
    try {
      await sendEmail({
        to: u.donorEmail,
        from: mailFrom(MAIL_ADDRESSES.donations),
        ...await renderEmail('PerkInvite', {
          name: u.donorName === 'Anonymous' ? u.donorHandle : u.donorName,
          project: u.campaignTitle,
          tiers: u.tiers,
          perksUrl: perksUrl(origin, u.donorId, u.campaignId),
        }),
      })
      await recordPerkInvite(u.donorId, u.campaignId)
      results.push({ email: u.donorEmail, result: 'sent' })
    }
    catch (err) {
      const e = err as { statusMessage?: string, message?: string }
      results.push({ email: u.donorEmail, result: 'failed', reason: e.statusMessage ?? e.message ?? 'unknown error' })
    }
  }

  return results
})
