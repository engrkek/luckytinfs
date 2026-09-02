/** Signals World Tour 2026 stops, in show order. date: 'Month D, YYYY' or null for TBA. */
export const TOUR_STOPS = [
  // North America Leg
  { id: 'honolulu', city: 'Honolulu', date: 'August 1, 2026' },
  { id: 'los-angeles', city: 'Los Angeles', date: 'August 5, 2026' },
  { id: 'rohnert-park', city: 'Rohnert Park', date: 'August 7, 2026' },
  { id: 'las-vegas', city: 'Las Vegas', date: 'August 8, 2026' },
  { id: 'san-diego', city: 'San Diego', date: 'August 9, 2026' },
  { id: 'vancouver', city: 'Vancouver', date: 'August 18, 2026' },
  { id: 'calgary', city: 'Calgary', date: 'August 21, 2026' },
  { id: 'edmonton', city: 'Edmonton', date: 'August 22, 2026' },
  { id: 'winnipeg', city: 'Winnipeg', date: 'August 24, 2026' },
  { id: 'toronto', city: 'Toronto', date: 'August 27, 2026' },
  { id: 'brooklyn', city: 'Brooklyn', date: 'August 28, 2026' },
  // Asia Leg 2
  { id: 'singapore', city: 'Singapore', date: 'October 25, 2026' },
  { id: 'taipei', city: 'Taipei', date: 'November 15, 2026' },
] as const satisfies readonly { id: string, city: string, date: string | null }[]

export type TourStop = typeof TOUR_STOPS[number]
export type TourStopId = TourStop['id']

/** Derived from TOUR_STOPS so the list above stays the single source of truth */
export const TOUR_STOP_IDS = TOUR_STOPS.map(s => s.id) as unknown as readonly [TourStopId, ...TourStopId[]]

const DAY_MS = 86_400_000

// ponytail: Date.parse in server-local time — a show "passes" at local midnight after the show date; switch to venue timezones if that day-boundary ever matters
function hasPassed(stop: TourStop, now: Date) {
  return stop.date != null && Date.parse(stop.date) + DAY_MS <= now.getTime()
}

/** First stop whose show hasn't passed (dateless = upcoming). After the tour: last stop. */
export function nextTourStop(now = new Date()): TourStop {
  return TOUR_STOPS.find(s => !hasPassed(s, now)) ?? TOUR_STOPS.at(-1)!
}

/** The stop whose show is today, if any */
export function todaysTourStop(now = new Date()): TourStop | undefined {
  return TOUR_STOPS.find((s) => {
    if (!s.date)
      return false
    const start = Date.parse(s.date)
    return now.getTime() >= start && now.getTime() < start + DAY_MS
  })
}

/** A letter aimed at a past show rolls forward to the next stop instead. */
export function resolveTourStop(id: TourStopId, now = new Date()): TourStopId {
  const stop = TOUR_STOPS.find(s => s.id === id)!
  return hasPassed(stop, now) ? nextTourStop(now).id : stop.id
}
