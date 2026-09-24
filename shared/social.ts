const PLATFORMS: Record<string, { icon: string, host: string, profile?: (h: string) => string }> = {
  x: { icon: 'ph:x-logo', host: 'x.com', profile: h => `https://x.com/${h}` },
  twitter: { icon: 'ph:x-logo', host: 'twitter.com', profile: h => `https://x.com/${h}` },
  instagram: { icon: 'ph:instagram-logo', host: 'instagram.com', profile: h => `https://instagram.com/${h}` },
  tiktok: { icon: 'ph:tiktok-logo', host: 'tiktok.com', profile: h => `https://tiktok.com/@${h}` },
  threads: { icon: 'ph:threads-logo', host: 'threads.net', profile: h => `https://threads.net/@${h}` },
  facebook: { icon: 'ph:facebook-logo', host: 'facebook.com', profile: h => `https://facebook.com/${h}` },
}

/** Case-insensitive: imported rows store "Instagram", the form stores "instagram" */
export function socialIcon(platform?: string | null) {
  return PLATFORMS[platform?.toLowerCase() ?? '']?.icon ?? 'ph:link'
}

const HANDLE = /^@?([\w.]{1,30})$/
// Path segments that are pages, not usernames (facebook.com/share/…, /profile.php?id=…)
const NOT_HANDLES = new Set(['share', 'profile.php', 'people', 'p', 'reel', 'status', 'i'])

/**
 * People type anything into "social handle": @name, name, a profile URL with tracking
 * params, a share link, their real name, even an email. Show a clean @handle where one
 * can be recovered, link when we know where it goes, and otherwise show the raw text.
 */
export function formatSocial(platform?: string | null, value?: string | null): { label: string, url?: string } | null {
  const raw = value?.trim()
  if (!raw)
    return null
  const p = PLATFORMS[platform?.toLowerCase() ?? '']

  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw)
      const segment = url.pathname.split('/').filter(Boolean)[0]?.replace(/^@/, '')
      const clean = `${url.origin}${url.pathname}` // drop tracking params (?stkn=, ?mibextid=)
      if (segment && !NOT_HANDLES.has(segment) && HANDLE.test(segment))
        return { label: `@${segment}`, url: clean }
      const host = url.hostname.replace(/^(www|m)\./, '')
      const known = Object.values(PLATFORMS).find(x => x.host === host)
      return { label: known ? `${host} link` : host, url: clean }
    }
    catch {
      return { label: raw }
    }
  }

  const handle = raw.match(HANDLE)?.[1]
  if (handle)
    return { label: `@${handle}`, url: p?.profile?.(handle) }

  return { label: raw } // a real name, an email, etc. — show as typed, don't guess a link
}
