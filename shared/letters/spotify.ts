/** Spotify link helpers for letter background music. */

export type SpotifyResourceType = 'track' | 'album' | 'playlist' | 'episode' | 'show'

export interface SpotifyResource {
  type: SpotifyResourceType
  id: string
  openUrl: string
  embedUrl: string
}

const TYPES = ['track', 'album', 'playlist', 'episode', 'show'] as const

/**
 * Accepts open.spotify.com links, spotify: URIs, and common intl paths.
 * Returns null if the string is not a usable Spotify resource.
 */
export function parseSpotifyLink(input: string | null | undefined): SpotifyResource | null {
  if (!input)
    return null

  const raw = input.trim()
  if (!raw)
    return null

  // spotify:track:id
  const uri = raw.match(/^spotify:(track|album|playlist|episode|show):([a-z0-9]+)$/i)
  if (uri) {
    const type = uri[1]!.toLowerCase() as SpotifyResourceType
    const id = uri[2]!
    return build(type, id)
  }

  // URLs — strip tracking params, handle intl locales
  let url: URL
  try {
    url = new URL(raw.startsWith('http') ? raw : `https://${raw}`)
  }
  catch {
    return null
  }

  const host = url.hostname.replace(/^www\./, '')
  if (host !== 'open.spotify.com' && host !== 'spotify.link' && host !== 'spotify.app.link') {
    // spotify.link short links need resolving — reject for now (client can't expand reliably)
    if (host.includes('spotify'))
      return null
    return null
  }

  // /track/id, /intl-en/track/id, /embed/track/id
  const parts = url.pathname.split('/').filter(Boolean)
  let type: string | undefined
  let id: string | undefined

  for (let i = 0; i < parts.length; i++) {
    const p = parts[i]!.toLowerCase()
    if ((TYPES as readonly string[]).includes(p) && parts[i + 1]) {
      type = p
      id = parts[i + 1]!.split('?')[0]
      break
    }
  }

  if (!type || !id || !/^[a-z0-9]+$/i.test(id))
    return null

  return build(type as SpotifyResourceType, id)
}

function build(type: SpotifyResourceType, id: string): SpotifyResource {
  return {
    type,
    id,
    openUrl: `https://open.spotify.com/${type}/${id}`,
    embedUrl: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
  }
}

export function isSpotifyLink(input: string | null | undefined): boolean {
  return parseSpotifyLink(input) !== null
}

/** Normalize for storage — empty / invalid becomes undefined */
export function normalizeSpotifyMusic(input: string | null | undefined): string | undefined {
  const parsed = parseSpotifyLink(input)
  return parsed?.openUrl
}
