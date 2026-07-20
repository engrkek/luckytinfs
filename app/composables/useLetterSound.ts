const STORAGE_KEY = 'luckytin:letter-sound'

export type LetterSoundPref = 'pending' | 'on' | 'off'

/**
 * Session-wide soundtrack preference for the letters experience.
 * Chosen on the letters landing page so YouTube autoplay has a real user gesture.
 */
export function useLetterSound() {
  const pref = useState<LetterSoundPref>('letter-sound-pref', () => 'pending')

  if (import.meta.client && pref.value === 'pending') {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (stored === 'on' || stored === 'off')
        pref.value = stored
    }
    catch {
      // private mode / blocked storage
    }
  }

  function setPref(next: Exclude<LetterSoundPref, 'pending'>) {
    pref.value = next
    if (import.meta.client) {
      try {
        sessionStorage.setItem(STORAGE_KEY, next)
      }
      catch {
        // ignore
      }
    }
  }

  function enable() {
    setPref('on')
  }

  function disable() {
    setPref('off')
  }

  const ready = computed(() => pref.value !== 'pending')
  const enabled = computed(() => pref.value === 'on')

  return {
    pref,
    ready,
    enabled,
    enable,
    disable,
    setPref,
  }
}
