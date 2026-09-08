import { z } from 'zod'

const registerSchema = z.object({
  id: z.string().min(1),
  fullName: z.string().trim().min(1),
  nickname: z.string().trim().min(1),
  email: z.email(),
  mobile: z.string().trim().min(1),
  primaryPlatform: z.string().trim().min(1),
  primaryUsername: z.string().trim().min(1),
  otherPlatform: z.string().trim().optional(),
  otherUsername: z.string().trim().optional(),
  childRegistration: z.enum(['sponsor', 'sponsor_two', 'bring']),
  minorName: z.string().trim().optional(),
  relationship: z.string().trim().optional(),
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, registerSchema.parse)

  // Map camelCase form body to lower_snake_case database columns
  const payload = {
    id: body.id,
    full_name: body.fullName,
    nickname: body.nickname,
    email: body.email,
    mobile: body.mobile,
    primary_platform: body.primaryPlatform,
    primary_username: body.primaryUsername,
    other_platform: body.otherPlatform || null,
    other_username: body.otherUsername || null,
    child_registration: body.childRegistration,
    minor_name: body.minorName || null,
    relationship: body.relationship || null,
  }

  const response = await blockscreeningSupabaseFetch(BLOCKSCREENING_REGISTRATIONS_TABLE, {
    useServiceKey: false,
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw createError({ statusCode: 404, statusMessage: `Table '${BLOCKSCREENING_REGISTRATIONS_TABLE}' not found in your database.` })
    }
    await throwSupabaseError(response, 'Failed to save registration to database.', 'Registration DB Error:')
  }

  return { success: true }
})
