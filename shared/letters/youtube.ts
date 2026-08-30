/** YouTube link helpers for letter background music. */

export interface YouTubeResource {
  id: string
  openUrl: string
  /** Base embed URL without query params */
  embedUrl: string
}

/**
 * Accepts youtube.com/watch, youtu.be, embed, shorts, and music.youtube.com.
 * Returns null if not a usable video link.
 */
export function parseYouTubeLink(input: string | null | undefined): YouTubeResource | null {
  if (!input)
    return null

  const raw = input.trim()
  if (!raw)
    return null

  let url: URL
  try {
    url = new URL(raw.startsWith('http') ? raw : `https://${raw}`)
  }
  catch {
    // bare video id
    if (/^[\w-]{11}$/.test(raw))
      return build(raw)
    return null
  }

  const host = url.hostname.replace(/^www\./, '').toLowerCase()
  const allowed = [
    'youtube.com',
    'm.youtube.com',
    'music.youtube.com',
    'youtu.be',
    'youtube-nocookie.com',
  ]
  if (!allowed.some(h => host === h || host.endsWith(`.${h}`)))
    return null

  let id: string | undefined

  if (host === 'youtu.be') {
    id = url.pathname.split('/').filter(Boolean)[0]
  }
  else {
    const v = url.searchParams.get('v')
    if (v) {
      id = v
    }
    else {
      const parts = url.pathname.split('/').filter(Boolean)
      // /embed/ID, /shorts/ID, /live/ID, /v/ID
      const markers = ['embed', 'shorts', 'live', 'v', 'e']
      for (let i = 0; i < parts.length; i++) {
        if (markers.includes(parts[i]!.toLowerCase()) && parts[i + 1]) {
          id = parts[i + 1]
          break
        }
      }
    }
  }

  if (!id)
    return null

  // strip timestamp junk from path segment
  id = id.replace(/[^\w-]/g, '').slice(0, 11)
  if (!/^[\w-]{11}$/.test(id))
    return null

  return build(id)
}

function build(id: string): YouTubeResource {
  return {
    id,
    openUrl: `https://www.youtube.com/watch?v=${id}`,
    embedUrl: `https://www.youtube.com/embed/${id}`,
  }
}

export function isYouTubeLink(input: string | null | undefined): boolean {
  return parseYouTubeLink(input) !== null
}

/** Normalize for storage — empty / invalid becomes undefined */
export function normalizeYouTubeMusic(input: string | null | undefined): string | undefined {
  return parseYouTubeLink(input)?.openUrl
}

/**
 * Build embed src with playback options.
 * autoplay requires a prior user gesture (landing “Play with sound”).
 */
export function youtubeEmbedSrc(
  input: string | null | undefined,
  options?: { autoplay?: boolean, mute?: boolean },
): string | null {
  const res = parseYouTubeLink(input)
  if (!res)
    return null

  const url = new URL(res.embedUrl)
  url.searchParams.set('playsinline', '1')
  url.searchParams.set('rel', '0')
  url.searchParams.set('modestbranding', '1')
  url.searchParams.set('enablejsapi', '1')
  if (options?.autoplay)
    url.searchParams.set('autoplay', '1')
  if (options?.mute)
    url.searchParams.set('mute', '1')
  return url.toString()
}
