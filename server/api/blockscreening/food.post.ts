import { eventRsvp } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { FOOD_OPTIONS } from '#shared/blockscreening'

const foodSchema = z.object({
  id: z.string().trim().toUpperCase().min(1).max(20),
  choices: z.array(z.enum(FOOD_OPTIONS as [string, ...string[]])).min(1).max(10),
})

export default defineEventHandler(async (event) => {
  const { id, choices } = await readValidatedBody(event, foodSchema.parse)
  const rsvp = await findFoodRsvp(id)

  // One pick per person, in the order food.get returned them
  const people = foodPeople(rsvp)
  if (choices.length !== people.length)
    throw createError({ statusCode: 400, statusMessage: 'Please choose a meal for everyone in your registration.' })

  await db.update(eventRsvp)
    .set({ food: people.map((name, i) => ({ name, choice: choices[i]! })) })
    .where(eq(eventRsvp.id, rsvp.id))

  return { success: true }
})
