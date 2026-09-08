import { z } from 'zod'

const paymentSchema = z.object({
  id: z.string().trim().min(1, 'Registration/Pass ID is required.'),
  paymentMode: z.array(z.string()).min(1, 'At least one Mode of Payment must be selected.'),
  paymentReference: z.string().trim().min(1, 'Payment Reference Number is required.'),
})

export default defineEventHandler(async (event) => {
  const { id, paymentMode, paymentReference } = await readValidatedBody(event, paymentSchema.parse)
  const formattedId = id.trim()

  // Explicitly validate that the Registration/Pass ID exists on the registrations table
  const checkResponse = await blockscreeningSupabaseFetch(
    `${BLOCKSCREENING_REGISTRATIONS_TABLE}?id=ilike.${encodeURIComponent(formattedId)}&select=id,full_name,nickname`,
  )
  if (!checkResponse.ok) {
    await throwSupabaseError(checkResponse, 'Failed to verify the registration ID.', 'Registration verification failed:')
  }

  const rows = await checkResponse.json()
  if (!rows || rows.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: `Registration/Pass ID '${formattedId}' was not found in the registration database. Please verify your ID or complete registration first.`,
    })
  }

  const registrant = rows[0]

  // Insert/upsert into the separate payments table
  const updateResponse = await blockscreeningSupabaseFetch(BLOCKSCREENING_PAYMENTS_TABLE, {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({
      id: registrant.id,
      payment_mode: paymentMode.join(', '),
      payment_reference: paymentReference.trim(),
    }),
  })
  if (!updateResponse.ok) {
    await throwSupabaseError(updateResponse, 'Failed to register the payment reference in the database.', 'Payment registration insert/upsert failed:')
  }

  return {
    success: true,
    fullName: registrant.full_name,
    nickname: registrant.nickname,
  }
})
