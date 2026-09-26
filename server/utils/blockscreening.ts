import type { H3Event } from 'h3'
import { and, eq } from 'drizzle-orm'
import { BLOCKSCREENING_REG_PREFIX, rsvpTicket } from '#shared/blockscreening'

interface SupabaseRequestOptions extends RequestInit {
  /** Use NUXT_SUPABASE_SERVICE_KEY when set, falling back to the anon key. Defaults to true. */
  useServiceKey?: boolean
}

function requireEnv(name: string, value = process.env[name]): string {
  if (!value) {
    throw createError({ statusCode: 500, statusMessage: `Block screening is misconfigured: missing ${name}.` })
  }
  return value
}

/** Table names for the block screening Supabase project, read from runtimeConfig. */
export function blockscreeningTables(event: H3Event) {
  const config = useRuntimeConfig(event)
  return {
    registrations: config.supabaseTableName,
    payments: config.supabasePaymentsTableName,
  }
}

/** Checks the shared admin passcode sent by the office console, via header or query param. */
export function requireBlockscreeningAdmin(event: H3Event) {
  const configuredPassword = requireEnv('BLOCKSCREENING_ADMIN_PASSWORD')
  const provided = getHeader(event, 'x-admin-password') || (getQuery(event).password as string | undefined)

  if (provided !== configuredPassword) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized. Please provide a valid block screening admin password.' })
  }
}

/** Direct PostgREST call against the block screening Supabase project (kept separate from this app's own D1 database). */
export async function blockscreeningSupabaseFetch(event: H3Event, path: string, options: SupabaseRequestOptions = {}) {
  const { useServiceKey = true, headers, ...init } = options
  const config = useRuntimeConfig(event)
  const url = requireEnv('NUXT_SUPABASE_URL', config.supabaseUrl)
  const key = (useServiceKey && config.supabaseServiceKey) || requireEnv('NUXT_SUPABASE_KEY', config.supabaseKey)

  return fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...headers,
    },
  })
}

/** Throws an H3 error built from a failed Supabase response, logging the raw error server-side. */
export async function throwSupabaseError(response: Response, fallbackMessage: string, logLabel: string): Promise<never> {
  const errorData = await response.json().catch(() => ({}))
  console.error(logLabel, errorData)
  throw createError({
    statusCode: response.status,
    statusMessage: errorData.message || fallbackMessage,
  })
}

/** Sends an email via Resend, falling back to a console log when RESEND_API_KEY isn't configured (e.g. local dev). */
export async function sendBlockscreeningEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  const resendApiKey = process.env.RESEND_API_KEY
  const from = process.env.MAIL_FROM || 'Luckytin Fan Support <noreply@luckytinfs.com>'

  if (!resendApiKey) {
    console.log(`[Email Dispatch - Key Not Configured] Would send "${subject}" to ${to}`)
    return
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    console.error('Resend API Error:', err)
    throw createError({ statusCode: res.status, statusMessage: err.message || 'Failed to dispatch email via Resend API.' })
  }
}

/** The office event the public forms write to, found by its Reg ID prefix. */
export async function getBlockscreeningEvent() {
  const ev = await db.query.event.findFirst({ where: eq(schema.event.regPrefix, BLOCKSCREENING_REG_PREFIX) })
  if (!ev)
    throw createError({ statusCode: 503, statusMessage: `Block screening isn't set up yet: no office event with Reg ID prefix ${BLOCKSCREENING_REG_PREFIX}.` })
  return ev
}

/** A ₱1,500 registration that's still active; SALE tickets don't come with a meal. */
export async function findFoodRsvp(regId: string) {
  const ev = await getBlockscreeningEvent()
  const rsvp = await db.query.eventRsvp.findFirst({ where: and(eq(schema.eventRsvp.eventId, ev.id), eq(schema.eventRsvp.regId, regId)) })
  if (!rsvp || rsvp.status === 'rejected' || rsvp.status === 'cancelled')
    throw createError({ statusCode: 404, statusMessage: `Registration ID '${regId}' was not found.` })
  if (rsvpTicket(rsvp) === 'sale')
    throw createError({ statusCode: 400, statusMessage: 'SALE tickets don\'t include a meal.' })
  if (!rsvp.attending)
    throw createError({ statusCode: 400, statusMessage: 'You\'re registered as a sponsor only, so there\'s no meal to choose. Your sponsored kids\' meals are taken care of.' })
  return rsvp
}

/** Registrant first, then their own kids. Sponsored charity kids are fed separately. */
export function foodPeople(rsvp: { fullName: string, companions: { name: string }[] | null }) {
  return [rsvp.fullName, ...(rsvp.companions ?? []).map(c => c.name)]
}
