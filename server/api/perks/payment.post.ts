import { channel, perkClaim } from '@nuxthub/db/schema'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

const paymentSchema = perkKey.extend({
  channelId: z.string().trim().min(1).max(50),
  refNo: z.string().trim().min(1).max(100),
  // Only paths /api/donations/proof returns, never an arbitrary URL
  proofUrl: z.string().max(500).startsWith('/images/donations/').refine(v => !v.includes('..')),
})

/** Donor submits their shipping fee payment for the office to verify. */
export default defineEventHandler(async (event) => {
  const { donor: donorId, campaign: campaignId, channelId, refNo, proofUrl } = await readValidatedBody(event, paymentSchema.parse)
  const { claim } = await getPerkContext(donorId, campaignId)

  // Resubmitting while still for_review just corrects the reference
  if (!claim || (claim.status !== 'awaiting_payment' && claim.status !== 'for_review'))
    throw createError({ statusCode: 409, statusMessage: 'This claim isn\'t waiting on a payment. Please message Luckytin Fan Support.' })

  // Only wallets the office has enabled for the public forms
  const wallet = await db.query.channel.findFirst({ where: and(eq(channel.id, channelId), eq(channel.isEnabled, true)) })
  if (!wallet)
    throw createError({ statusCode: 400, statusMessage: 'That wallet is no longer available. Please refresh and choose again.' })

  await db.update(perkClaim)
    .set({ channelId: wallet.id, refNo, proofUrl, status: 'for_review' })
    .where(eq(perkClaim.id, claim.id))

  return { success: true }
})
