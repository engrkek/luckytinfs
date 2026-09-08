import type { H3Event } from 'h3'

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
