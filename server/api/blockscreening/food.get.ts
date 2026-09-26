import { z } from 'zod'

/** Who in this registration picks a meal, and what they picked so far. */
export default defineEventHandler(async (event) => {
  const { id } = await getValidatedQuery(event, z.object({ id: z.string().trim().toUpperCase().min(1).max(20) }).parse)
  const rsvp = await findFoodRsvp(id)

  return {
    nickname: rsvp.nickname || rsvp.fullName,
    people: foodPeople(rsvp).map(name => ({ name, choice: rsvp.food?.find(f => f.name === name)?.choice ?? null })),
  }
})
