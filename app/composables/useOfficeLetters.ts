import type { LetterDesign, LetterStatus, LetterVisibility } from '#shared/letters/types'

export interface OfficeLetterReviewer {
  id: string
  name: string
}

export interface OfficeLetter {
  id: string
  recipient: string
  tourStop: string
  senderName: string
  body: string
  design: LetterDesign | null
  visibility: string
  status: LetterStatus
  adminNotes: string | null
  reviewedBy: string | null
  reviewer: OfficeLetterReviewer | null
  createdAt: string | number | Date
  updatedAt?: string | number | Date
}

export interface OfficeLettersResponse {
  letters: OfficeLetter[]
}

export interface OfficeLetterPatch {
  id: string
  status?: LetterStatus
  adminNotes?: string
  senderName?: string
  body?: string
  visibility?: LetterVisibility
  design?: LetterDesign
}

/**
 * Typed cache key for getQueryData / setQueryData.
 * Query fn is provided at use-site so SSR can use useRequestFetch() (cookie-aware).
 */
export const officeLettersQuery = defineQueryOptions({
  key: ['office', 'letters'],
  query: () => $fetch<OfficeLettersResponse>('/api/office/letters'),
})

/**
 * Office moderation queue: all letters with status counts handled client-side.
 * Shared cache entry so mutations can patch optimistically.
 *
 * Uses useRequestFetch so the session cookie is forwarded during SSR —
 * plain $fetch would 401 on the server (no cookies → unhandled auth errors).
 */
export const useOfficeLetters = defineQuery(() => {
  const requestFetch = useRequestFetch()
  const { data, ...rest } = useQuery({
    ...officeLettersQuery,
    query: () => requestFetch<OfficeLettersResponse>('/api/office/letters'),
  })
  const letters = computed(() => data.value?.letters ?? [])
  return { ...rest, data, letters }
})

/**
 * PATCH a letter with optimistic cache update + rollback on error.
 * Client-only (button clicks); browser $fetch already sends cookies.
 */
export const useUpdateOfficeLetter = defineMutation(() => {
  const queryCache = useQueryCache()
  const toast = useToast()
  const { user } = useUserSession()

  return useMutation({
    mutation: ({ id, ...body }: OfficeLetterPatch) =>
      $fetch<{ letter: OfficeLetter }>(`/api/office/letters/${id}`, {
        method: 'PATCH',
        body,
      }),

    onMutate(vars) {
      const previous = queryCache.getQueryData(officeLettersQuery.key)
      const me = user.value

      queryCache.setQueryData(officeLettersQuery.key, (old) => {
        if (!old)
          return old
        const { id, ...patch } = vars
        return {
          letters: old.letters.map((l) => {
            if (l.id !== id)
              return l
            const next: OfficeLetter = { ...l, ...patch }
            // Status changes stamp the current moderator as reviewer
            if (patch.status !== undefined && me) {
              next.reviewedBy = me.id
              next.reviewer = { id: me.id, name: me.name }
            }
            return next
          }),
        }
      })

      return { previous }
    },

    onError(err, _vars, { previous }) {
      if (previous)
        queryCache.setQueryData(officeLettersQuery.key, previous)

      const e = err as { data?: { statusMessage?: string }, message?: string }
      toast.add({
        title: 'Update failed',
        description: e.data?.statusMessage ?? e.message ?? 'Something went wrong',
        color: 'error',
      })
    },

    onSuccess({ letter }) {
      queryCache.setQueryData(officeLettersQuery.key, (old) => {
        if (!old)
          return old
        return {
          letters: old.letters.map(l => (l.id === letter.id ? { ...l, ...letter } : l)),
        }
      })
    },
  })
})
