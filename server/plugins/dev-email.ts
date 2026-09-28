// `nuxt dev` runs on Node, so there's no Cloudflare EMAIL binding for sendEmail to find.
// Borrow it from wrangler: `"remote": true` in wrangler.jsonc makes it send real mail through Email Service.
// https://developers.cloudflare.com/email-service/local-development/sending/#remote-bindings-recommended
// The local db is often a prod copy, so every dev email is redirected to DEV_MAIL_TO; unset = no sending.
interface Message { to: string, subject: string }

export default defineNitroPlugin(async (nitroApp) => {
  if (!import.meta.dev)
    return

  // a variable specifier keeps Nitro from bundling wrangler (its source breaks Nitro's NODE_ENV replacement)
  const pkg = 'wrangler'
  const { getPlatformProxy } = await import(pkg) as typeof import('wrangler')
  const proxy = await getPlatformProxy<{ EMAIL: { send: (m: Message) => Promise<unknown> } }>()
  nitroApp.hooks.hook('close', () => proxy.dispose())

  const g = globalThis as { __env__?: Record<string, unknown> }
  g.__env__ = {
    ...g.__env__,
    EMAIL: {
      send: (m: Message) => {
        const to = process.env.DEV_MAIL_TO
        if (!to)
          throw createError({ statusCode: 503, statusMessage: `Set DEV_MAIL_TO in .env to send from dev. Would have sent "${m.subject}" to ${m.to}.` })
        return proxy.env.EMAIL.send({ ...m, to, subject: `[dev → ${m.to}] ${m.subject}` })
      },
    },
  }
})
