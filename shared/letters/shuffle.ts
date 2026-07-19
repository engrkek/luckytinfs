/** Deterministic shuffle: same seed → same order. Used so "random" feed order is stable per tour stop instead of reshuffling on every reload. */
export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  let h = 0
  for (let i = 0; i < seed.length; i++)
    h = (Math.imul(h, 31) + seed.charCodeAt(i)) >>> 0

  const next = () => {
    h = (Math.imul(h, 1664525) + 1013904223) >>> 0
    return h / 0xFFFFFFFF
  }

  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1))
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}
