import type { CEvent, EventRsvp } from '#shared/types'
import { BLOCKSCREENING_REG_PREFIX, PAYMENT_DEADLINE, php, rsvpTicket, SALE_INCLUSIONS, TICKETS } from '#shared/blockscreening'

/** payment + confirmation work for any event; food + sponsor are block screening only */
export const EVENT_EMAILS = ['payment', 'confirmation', 'food', 'sponsor'] as const
export type EventEmail = typeof EVENT_EMAILS[number]

const when = new Intl.DateTimeFormat('en-PH', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Asia/Manila' })

/** Which /emails template to render for this registration, and with what props. */
export function eventEmail(kind: EventEmail, ev: CEvent, r: EventRsvp, origin: string) {
  const isBlockscreening = ev.regPrefix === BLOCKSCREENING_REG_PREFIX
  const ticket = isBlockscreening ? TICKETS[rsvpTicket(r)] : null
  const base = { name: r.nickname || r.fullName, eventName: ev.name, regId: r.regId }
  const id = encodeURIComponent(r.regId)

  if ((kind === 'food' || kind === 'sponsor') && !isBlockscreening)
    throw createError({ statusCode: 400, statusMessage: `The ${kind} email is only for the block screening.` })

  switch (kind) {
    case 'payment': {
      // ponytail: only the block screening has a public payment page; give other events one when they need it
      if (!isBlockscreening)
        throw createError({ statusCode: 400, statusMessage: 'This event has no payment page yet.' })
      const amount = ticket?.price ?? r.regFee ?? ev.fee
      if (amount == null)
        throw createError({ statusCode: 400, statusMessage: 'Set a fee on the event or registration first.' })
      return {
        template: 'EventPayment',
        props: { ...base, amount: php(amount), item: ticket?.label, paymentUrl: `${origin}/blockscreening/payment?id=${id}`, deadline: PAYMENT_DEADLINE },
      }
    }

    case 'confirmation': {
      const details: { label: string, value: string }[] = []
      if (ticket)
        details.push({ label: 'Ticket', value: rsvpTicket(r) === 'sale' ? `${ticket.label}: ${SALE_INCLUSIONS.join(', ')}` : ticket.label })
      if (r.companions?.length)
        details.push({ label: 'Companion', value: r.companions.map(c => c.relationship ? `${c.name} (${c.relationship})` : c.name).join(', ') })
      return {
        template: 'EventConfirmation',
        props: { ...base, fullName: r.fullName, when: when.format(ev.date), where: ev.venue, details },
      }
    }

    case 'food':
      return {
        template: 'BlockscreeningFood',
        props: { ...base, people: foodPeople(r), foodUrl: `${origin}/blockscreening/food?id=${id}` },
      }

    case 'sponsor':
      if (!r.sponsoredKids)
        throw createError({ statusCode: 400, statusMessage: `${r.fullName} isn't sponsoring any kids.` })
      return {
        template: 'BlockscreeningSponsor',
        props: { ...base, kids: r.sponsoredKids, when: when.format(ev.date) },
      }
  }
}
