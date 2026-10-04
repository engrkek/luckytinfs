import { perkClaim } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { php } from '#shared/blockscreening'
import { MAIL_ADDRESSES } from '#shared/mail'

/** Emails the donor their shipping fee with a link to pay it. Moves the claim to awaiting_payment, only after a successful send. */
export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const { id } = await getValidatedRouterParams(event, z.object({ id: z.string().trim() }).parse)

  const claim = await db.query.perkClaim.findFirst({ where: eq(perkClaim.id, id) })
  if (!claim)
    throw createError({ statusCode: 404, statusMessage: 'Perk claim not found' })
  if (!claim.shippingFee)
    throw createError({ statusCode: 400, statusMessage: 'Set the shipping fee first.' })
  if (claim.status !== 'submitted' && claim.status !== 'awaiting_payment')
    throw createError({ statusCode: 400, statusMessage: 'This donor has already paid their shipping fee.' })

  const { donor, campaign } = await getPerkContext(claim.donorId, claim.campaignId)

  await sendEmail({
    to: donor.email,
    from: mailFrom(MAIL_ADDRESSES.donations),
    ...await renderEmail('PerkShipping', {
      name: donor.name === 'Anonymous' ? donor.handle : donor.name,
      project: campaign.title,
      amount: php(claim.shippingFee),
      courier: claim.courier,
      recipientName: claim.recipientName,
      address: claim.address,
      paymentUrl: perksUrl(getRequestURL(event).origin, donor.id, campaign.id),
    }),
  })

  const [updated] = await db.update(perkClaim)
    .set({ status: 'awaiting_payment', paymentEmailSentAt: new Date() })
    .where(eq(perkClaim.id, claim.id))
    .returning()
  return updated
})
