import { createError, defineEventHandler, getHeader, readBody } from 'h3'

const paymentReceivers = new Set(['Kek', 'Min'])

export default defineEventHandler(async (event) => {
  const adminPassword = process.env.BLOCKSCREENING_ADMIN_PASSWORD || 'luckytin02'
  if (getHeader(event, 'x-admin-password') !== adminPassword) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized. Please provide valid admin credentials.' })
  }

  const { id, paymentReceiver } = await readBody(event)
  if (!id || typeof id !== 'string' || (paymentReceiver !== null && !paymentReceivers.has(paymentReceiver))) {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid payment receiver update payload.' })
  }

  const supabaseUrl = process.env.NUXT_SUPABASE_URL || 'https://yqaforptbwlyfavadaky.supabase.co'
  const supabaseKey = process.env.NUXT_SUPABASE_SERVICE_KEY || process.env.NUXT_SUPABASE_KEY || 'sb_publishable_hHmRNH_QDvA8b05DmRaWpQ_TJVcQLtj'
  const paymentsTable = process.env.NUXT_SUPABASE_PAYMENTS_TABLE_NAME || 'block_screening_payments'
  const paymentId = id.trim()
  const paymentsUrl = `${supabaseUrl}/rest/v1/${paymentsTable}`
  const headers = {
    'apikey': supabaseKey,
    'Authorization': `******`,
    'Content-Type': 'application/json',
  }

  try {
    const existingResponse = await fetch(`${paymentsUrl}?select=id,payment_receiver`, {
      method: 'GET',
      headers,
    })

    if (!existingResponse.ok) {
      const errorData = await existingResponse.json().catch(() => ({}))
      console.error('Supabase DB Error (GET payment record):', errorData)
      throw createError({
        statusCode: existingResponse.status,
        statusMessage: errorData.message || 'Failed to find payment record in Database.',
      })
    }

    const existingRows = await existingResponse.json()
    const paymentIdNormalized = paymentId.toLowerCase()
    const existingPayment = Array.isArray(existingRows)
      ? existingRows.find((row: any) => String(row.id).trim().toLowerCase() === paymentIdNormalized)
      : null

    if (!existingPayment) {
      throw createError({
        statusCode: 404,
        statusMessage: `Payment record '${paymentId}' was not found in Database.`,
      })
    }

    const storedPaymentId = String(existingPayment.id)
    const paymentUrl = `${paymentsUrl}?id=eq.${encodeURIComponent(storedPaymentId)}`
    const response = await fetch(paymentUrl, {
      method: 'PATCH',
      headers: { ...headers, Prefer: 'return=minimal' },
      body: JSON.stringify({ payment_receiver: paymentReceiver }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('DB Update Error (PATCH payment_receiver):', errorData)
      throw createError({
        statusCode: response.status,
        statusMessage: errorData.message || 'Failed to update payment receiver in database.',
      })
    }

    const updatedResponse = await fetch(`${paymentUrl}&select=id,payment_receiver`, {
      method: 'GET',
      headers,
    })
    if (!updatedResponse.ok) {
      const errorData = await updatedResponse.json().catch(() => ({}))
      console.error('Supabase DB Error (GET updated payment record):', errorData)
      throw createError({
        statusCode: updatedResponse.status,
        statusMessage: errorData.message || 'Failed to verify payment receiver update in the database.',
      })
    }

    const updatedRows = await updatedResponse.json()
    if (!Array.isArray(updatedRows) || updatedRows.length === 0 || updatedRows[0].payment_receiver !== paymentReceiver) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Supabase did not persist the payment receiver update.',
      })
    }

    return { success: true, id: storedPaymentId, paymentReceiver }
  }
  catch (error: any) {
    console.error('Payment receiver update error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'An unexpected error occurred while updating payment receiver.',
    })
  }
})
