import { perkClaim } from '@nuxthub/db/schema'
import { z } from 'zod'
import { COURIERS } from '#shared/perks'

const postSchema = perkKey.extend({
  recipientName: z.string().trim().min(1).max(100),
  phone: z.string().trim().regex(/^[\d+\s()-]{7,20}$/, 'Enter a valid mobile number'),
  address: z.string().trim().min(10).max(500),
  courier: z.enum(COURIERS),
  size: z.string().trim().max(20).optional(),
  notes: z.string().trim().max(500).optional(),
})

/** Donor submits (or corrects) their shipping details. Locked once the shipping fee is quoted, since the fee depends on them. */
export default defineEventHandler(async (event) => {
  const { donor: donorId, campaign: campaignId, size, notes, ...details } = await readValidatedBody(event, postSchema.parse)
  const { tiers, sizes, claim } = await getPerkContext(donorId, campaignId)

  if (!tiers.length)
    throw createError({ statusCode: 404, statusMessage: 'There are no perks to claim yet.' })
  if (claim && claim.status !== 'submitted')
    throw createError({ statusCode: 409, statusMessage: 'Your shipping fee is already set. Please message Luckytin Fan Support to change your details.' })
  if (sizes.length && !sizes.includes(size ?? ''))
    throw createError({ statusCode: 400, statusMessage: 'Please choose a size.' })

  const values = { ...details, size: sizes.length ? size : null, notes: notes || null }
  await db.insert(perkClaim)
    .values({ donorId, campaignId, ...values })
    .onConflictDoUpdate({ target: [perkClaim.donorId, perkClaim.campaignId], set: values })

  return { success: true }
})
