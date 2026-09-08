const VALID_PAYMENT_RECEIVERS = new Set(['Kek', 'Min'])

export default defineEventHandler(async (event) => {
  requireBlockscreeningAdmin(event)

  const { id, paymentReceiver } = await readBody(event)
  if (!id || typeof id !== 'string' || (paymentReceiver !== null && !VALID_PAYMENT_RECEIVERS.has(paymentReceiver))) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid payment receiver update payload.' })
  }

  const paymentId = id.trim()
  const { payments: paymentsPath } = blockscreeningTables(event)

  const existingResponse = await blockscreeningSupabaseFetch(event, `${paymentsPath}?select=id,payment_receiver`)
  if (!existingResponse.ok) {
    await throwSupabaseError(existingResponse, 'Failed to find payment record in Database.', 'Supabase DB Error (GET payment record):')
  }

  const existingRows = await existingResponse.json()
  const paymentIdNormalized = paymentId.toLowerCase()
  const existingPayment = Array.isArray(existingRows)
    ? existingRows.find((row: any) => String(row.id).trim().toLowerCase() === paymentIdNormalized)
    : null

  if (!existingPayment) {
    throw createError({ statusCode: 404, statusMessage: `Payment record '${paymentId}' was not found in Database.` })
  }

  const storedPaymentId = String(existingPayment.id)
  const recordPath = `${paymentsPath}?id=eq.${encodeURIComponent(storedPaymentId)}`

  const response = await blockscreeningSupabaseFetch(event, recordPath, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ payment_receiver: paymentReceiver }),
  })
  if (!response.ok) {
    await throwSupabaseError(response, 'Failed to update payment receiver in database.', 'DB Update Error (PATCH payment_receiver):')
  }

  const updatedResponse = await blockscreeningSupabaseFetch(event, `${recordPath}&select=id,payment_receiver`)
  if (!updatedResponse.ok) {
    await throwSupabaseError(updatedResponse, 'Failed to verify payment receiver update in the database.', 'Supabase DB Error (GET updated payment record):')
  }

  const updatedRows = await updatedResponse.json()
  if (!Array.isArray(updatedRows) || updatedRows.length === 0 || updatedRows[0].payment_receiver !== paymentReceiver) {
    throw createError({ statusCode: 500, statusMessage: 'Supabase did not persist the payment receiver update.' })
  }

  return { success: true, id: storedPaymentId, paymentReceiver }
})
