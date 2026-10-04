import { fulfillment, perkClaim } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { php } from '#shared/blockscreening'
import { MAIL_ADDRESSES } from '#shared/mail'
import { PERK_STATUSES, perkUpdateEmail } from '#shared/perks'

const patchSchema = z.object({
  shippingFee: z.number().int().nonnegative().optional(),
  status: z.enum(PERK_STATUSES).optional(),
  trackingNo: z.string().trim().max(100).optional(),
  rejectReason: z.string().trim().max(300).optional(), // only used in the email when this save rejects a payment
  resend: z.boolean().optional(), // send the paid/shipped email again, e.g. after adding a tracking number
})

/**
 * Saves the claim. Status changes the donor should hear about (see perkUpdateEmail) also email them;
 * a failed email never undoes the save.
 */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { id } = await getValidatedRouterParams(event, z.object({ id: z.string().trim() }).parse)
  const { status, rejectReason, resend, ...data } = await readValidatedBody(event, patchSchema.parse)

  const before = await db.query.perkClaim.findFirst({ where: eq(perkClaim.id, id) })
  if (!before)
    throw createError({ statusCode: 404, statusMessage: 'Perk claim not found' })

  const [updated] = await db.update(perkClaim)
    .set({ ...data, ...(status ? { status, reviewedBy: user.id } : {}) })
    .where(eq(perkClaim.id, id))
    .returning()
  const claim = updated!

  const change = perkUpdateEmail(before.status, claim.status)
  const kind = change ?? (resend && (claim.status === 'paid' || claim.status === 'shipped') ? claim.status : null)

  let emailed = false
  let emailError: string | null = null
  if (kind) {
    const { donor, campaign, tiers } = await getPerkContext(claim.donorId, claim.campaignId)

    // Shipped = the donor's earned tiers are handed over, so owed (earned − fulfilled) drops to zero
    if (change === 'shipped' && tiers.length) {
      await db.insert(fulfillment)
        .values(tiers.map(t => ({ donorId: donor.id, tierId: t.id, fulfilledBy: user.id, notes: claim.trackingNo })))
        .onConflictDoNothing()
    }

    try {
      await sendEmail({
        to: donor.email,
        from: mailFrom(MAIL_ADDRESSES.donations),
        ...await renderEmail('PerkUpdate', {
          name: donor.name === 'Anonymous' ? donor.handle : donor.name,
          project: campaign.title,
          status: kind,
          courier: claim.courier,
          trackingNo: claim.trackingNo,
          amount: claim.shippingFee != null ? php(claim.shippingFee) : null,
          reason: rejectReason || null,
          perksUrl: perksUrl(getRequestURL(event).origin, donor.id, campaign.id),
        }),
      })
      emailed = true
    }
    catch (err) {
      const e = err as { statusMessage?: string, message?: string }
      emailError = e.statusMessage ?? e.message ?? 'unknown error'
    }
  }

  return { ...claim, emailed, emailError }
})
