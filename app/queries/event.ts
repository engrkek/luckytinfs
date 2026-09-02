import type { CEvent } from '~~/shared/types'

const EVENT_QUERY_KEYS = {
  root: ['events'] as const,
  byId: (id: string) => [...EVENT_QUERY_KEYS.root, id] as const,
}

export const eventsQuery = defineQueryOptions({
  key: EVENT_QUERY_KEYS.root,
  // NOTE: the cast sometimes avoids an "Excessive depth check" TS error
  // using $fetch directly doesn't avoid the round trip to the server
  // when doing SSR
  // https://github.com/nuxt/nuxt/issues/24813
  query: () => useRequestFetch()('/api/office/events') as Promise<CEvent[]>,
})

export const eventQuery = defineQueryOptions(({ id }: { id: string }) => ({
  key: EVENT_QUERY_KEYS.byId(id),
  query: () => useRequestFetch()(`/api/office/events/${id}`) as Promise<CEvent>,
}))
