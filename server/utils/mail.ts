import { MAIL_ADDRESSES } from '#shared/mail'

interface EmailAddress { email: string, name: string }

// ponytail: just the slice of the Workers `send_email` binding we call; run `wrangler types` if we need more
interface EmailBinding {
  send: (message: { to: string, from: EmailAddress, subject: string, html: string, text: string, headers?: Record<string, string> }) => Promise<unknown>
}

export function mailFrom(address: string, name = 'Luckytin Fan Support'): EmailAddress {
  return { email: address, name }
}

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text: string
  from?: EmailAddress
  headers?: Record<string, string>
}

/**
 * Sends via Cloudflare Email Service (the `EMAIL` send_email binding in wrangler.jsonc).
 * Always throws without the binding, so the office never shows "sent" for mail that wasn't.
 */
export async function sendEmail({ from = mailFrom(MAIL_ADDRESSES.admin), ...message }: SendEmailOptions) {
  // Nitro's cloudflare preset stashes the invocation's bindings here, same as NuxtHub's DB/blob lookups
  const EMAIL = (globalThis as { __env__?: { EMAIL?: EmailBinding } }).__env__?.EMAIL

  if (!EMAIL) {
    // ponytail: `nuxt dev` runs the node preset, which has no Cloudflare bindings; preview the HTML in DevTools, test sends on preview.luckytinfs.com
    throw createError({
      statusCode: 503,
      statusMessage: import.meta.dev
        ? `Emails can't be sent from local dev (no Cloudflare EMAIL binding). Would have sent "${message.subject}" to ${message.to}.`
        : 'Email binding not configured',
    })
  }

  await EMAIL.send({ from, ...message })
}

/** Renders a template from /emails; its <ESubject> becomes the subject. */
export async function renderEmail(template: string, props: Record<string, unknown>) {
  const [rendered, text] = await Promise.all([
    renderEmailComponent(template, props),
    renderEmailComponent(template, props, { plainText: true }),
  ])
  if (typeof rendered === 'string' || typeof text === 'string')
    throw createError({ statusCode: 500, statusMessage: `Email template ${template} is missing <ESubject>` })
  return { subject: rendered.subject, html: rendered.html, text: text.html }
}
