import type { DonationStatus } from '#shared/donations'

export interface OfficeDonationReviewer {
  id: string
  name: string
}

export interface OfficeDonationDonor {
  id: string
  name: string
  handle: string
  social: string
  email: string
}

export interface OfficeDonation {
  id: string
  amount: number
  display: string
  refNo: string | null
  proofUrl: string | null
  status: DonationStatus
  donorNotes: string | null
  adminNotes: string | null
  reviewedBy: string | null
  reviewer: OfficeDonationReviewer | null
  donor: OfficeDonationDonor
  campaignId: string | null
  campaignTitle: string | null
  channelId: string
  channelLabel: string
  createdAt: string | number | Date
  updatedAt?: string | number | Date
}

export interface OfficeDonationsResponse {
  donations: OfficeDonation[]
}

export interface OfficeDonationPatch {
  id: string
  status?: DonationStatus
  adminNotes?: string
  campaignId?: string | null
  amount?: number
  channelId?: string
  refNo?: string
  proofUrl?: string
  display?: string
  donorNotes?: string
  donor?: Partial<Omit<OfficeDonationDonor, 'id'>>
}

/**
 * Typed cache key for getQueryData / setQueryData.
 * Query fn is provided at use-site so SSR can use useRequestFetch() (cookie-aware).
 */
export const officeDonationsQuery = defineQueryOptions({
  key: ['office', 'donations'],
  query: () => $fetch<OfficeDonationsResponse>('/api/office/donations'),
})

/**
 * Office moderation queue: all donations with status counts handled client-side.
 * Shared cache entry so mutations can patch optimistically.
 *
 * Uses useRequestFetch so the session cookie is forwarded during SSR —
 * plain $fetch would 401 on the server (no cookies → unhandled auth errors).
 */
export const useOfficeDonations = defineQuery(() => {
  const requestFetch = useRequestFetch()
  const { data, ...rest } = useQuery({
    ...officeDonationsQuery,
    query: () => requestFetch<OfficeDonationsResponse>('/api/office/donations'),
  })
  const donations = computed(() => data.value?.donations ?? [])
  return { ...rest, data, donations }
})

/**
 * PATCH a donation with optimistic cache update + rollback on error.
 * Client-only (button clicks); browser $fetch already sends cookies.
 */
export const useUpdateOfficeDonation = defineMutation(() => {
  const queryCache = useQueryCache()
  const toast = useToast()
  const { user } = useUserSession()

  return useMutation({
    mutation: ({ id, ...body }: OfficeDonationPatch) =>
      $fetch<{ donation: OfficeDonation }>(`/api/office/donations/${id}`, {
        method: 'PATCH',
        body,
      }),

    onMutate(vars) {
      const previous = queryCache.getQueryData(officeDonationsQuery.key)
      const me = user.value

      queryCache.setQueryData(officeDonationsQuery.key, (old) => {
        if (!old)
          return old
        const { id, ...patch } = vars
        return {
          donations: old.donations.map((d) => {
            if (d.id !== id)
              return d
            const next: OfficeDonation = {
              ...d,
              ...patch,
              ...(patch.donor ? { donor: { ...d.donor, ...patch.donor } } : {}),
            }
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
        queryCache.setQueryData(officeDonationsQuery.key, previous)

      const e = err as { data?: { statusMessage?: string }, message?: string }
      toast.add({
        title: 'Update failed',
        description: e.data?.statusMessage ?? e.message ?? 'Something went wrong',
        color: 'error',
      })
    },

    onSuccess({ donation }) {
      queryCache.setQueryData(officeDonationsQuery.key, (old) => {
        if (!old)
          return old
        return {
          donations: old.donations.map(d => (d.id === donation.id ? { ...d, ...donation } : d)),
        }
      })
    },
  })
})

/**
 * DELETE a donation with optimistic cache removal + rollback on error.
 * Client-only (button clicks); browser $fetch already sends cookies.
 */
export const useDeleteOfficeDonation = defineMutation(() => {
  const queryCache = useQueryCache()
  const toast = useToast()

  return useMutation({
    mutation: ({ id }: { id: string }) =>
      $fetch(`/api/office/donations/${id}`, { method: 'DELETE' }),

    onMutate({ id }) {
      const previous = queryCache.getQueryData(officeDonationsQuery.key)

      queryCache.setQueryData(officeDonationsQuery.key, (old) => {
        if (!old)
          return old
        return { donations: old.donations.filter(d => d.id !== id) }
      })

      return { previous }
    },

    onError(err, _vars, { previous }) {
      if (previous)
        queryCache.setQueryData(officeDonationsQuery.key, previous)

      const e = err as { data?: { statusMessage?: string }, message?: string }
      toast.add({
        title: 'Delete failed',
        description: e.data?.statusMessage ?? e.message ?? 'Something went wrong',
        color: 'error',
      })
    },
  })
})
