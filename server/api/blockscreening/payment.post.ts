import { channel, eventRsvp } from '@nuxthub/db/schema'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { rsvpTicket, TICKETS } from '#shared/blockscreening'

const paymentSchema = z.object({
  id: z.string().trim().toUpperCase().min(1, 'Registration/Pass ID is required.').max(20),
  channelId: z.string().trim().min(1, 'Please choose the wallet you paid to.').max(50),
  paymentReference: z.string().trim().min(1, 'Payment Reference Number is required.').max(100),
  // Only paths our own proof upload returns, never an arbitrary URL
  receiptUrl: z.string().max(500).startsWith('/images/receipts/', 'Please attach a screenshot of your payment.').refine(v => !v.includes('..')),
})

export default defineEventHandler(async (event) => {
  const { id, channelId, paymentReference, receiptUrl } = await readValidatedBody(event, paymentSchema.parse)
  const ev = await getBlockscreeningEvent()

  // Only wallets the office has enabled for the public forms
  const wallet = await db.query.channel.findFirst({ where: and(eq(channel.id, channelId), eq(channel.isEnabled, true)) })
  if (!wallet)
    throw createError({ statusCode: 400, statusMessage: 'That wallet is no longer available. Please refresh and choose again.' })

  const rsvp = await db.query.eventRsvp.findFirst({ where: and(eq(eventRsvp.eventId, ev.id), eq(eventRsvp.regId, id)) })
  if (!rsvp) {
    throw createError({
      statusCode: 404,
      statusMessage: `Registration ID '${id}' was not found. Please check your ID or complete registration first.`,
    })
  }
  // Resubmitting while still for_review just corrects the reference
  if (rsvp.status !== 'pending_payment' && rsvp.status !== 'for_review')
    throw createError({ statusCode: 409, statusMessage: `Registration ${id} can no longer accept payments. Please message Luckytin Fan Support.` })

  await db.update(eventRsvp).set({
    refNo: paymentReference,
    channelId: wallet.id,
    receiptUrl,
    regFee: TICKETS[rsvpTicket(rsvp)].price,
    status: 'for_review',
  }).where(eq(eventRsvp.id, rsvp.id))

  return { success: true, fullName: rsvp.fullName, nickname: rsvp.nickname }
})
