/**
 * Character-by-character reveal for letter body text.
 * Respects prefers-reduced-motion (shows full text immediately).
 */
export function useTypewriter(
  source: Ref<string> | ComputedRef<string>,
  options?: {
    /** ms per character — slower for short letters, faster for long */
    cps?: number
    /** start only when true */
    active?: Ref<boolean> | ComputedRef<boolean>
  },
) {
  const displayed = ref('')
  const done = ref(false)
  /** 0–1 fraction of the source typed so far */
  const progress = computed(() => {
    const full = unref(source)
    if (!full.length)
      return done.value ? 1 : 0
    if (done.value)
      return 1
    return Math.min(1, displayed.value.length / full.length)
  })

  function prefersReducedMotion() {
    if (!import.meta.client)
      return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  let timer: ReturnType<typeof setTimeout> | null = null
  let index = 0

  function clear() {
    if (timer != null) {
      clearTimeout(timer)
      timer = null
    }
  }

  function finish() {
    clear()
    displayed.value = unref(source)
    done.value = true
    index = unref(source).length
  }

  function tick() {
    const full = unref(source)
    if (index >= full.length) {
      done.value = true
      timer = null
      return
    }

    // Type slightly faster on spaces/newlines so rhythm feels natural
    const ch = full[index]!
    index++
    displayed.value = full.slice(0, index)

    const cps = options?.cps ?? 42
    const base = 1000 / cps
    const delay = ch === '\n'
      ? base * 3.2
      : ch === ' '
        ? base * 0.55
        : base * (0.75 + Math.random() * 0.55)

    timer = setTimeout(tick, delay)
  }

  function start() {
    clear()
    const full = unref(source)
    if (prefersReducedMotion() || !full) {
      finish()
      return
    }
    index = 0
    displayed.value = ''
    done.value = false
    tick()
  }

  function reset() {
    clear()
    index = 0
    displayed.value = ''
    done.value = false
  }

  watch(
    () => [unref(source), options?.active ? unref(options.active) : true] as const,
    ([, isActive]) => {
      if (!isActive) {
        reset()
        return
      }
      start()
    },
    { immediate: true },
  )

  onBeforeUnmount(clear)

  return {
    displayed,
    done: readonly(done),
    progress: readonly(progress),
    skip: finish,
    restart: start,
    reset,
  }
}
