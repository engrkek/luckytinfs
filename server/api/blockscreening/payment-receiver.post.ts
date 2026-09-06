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

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/${paymentsTable}?id=eq.${encodeURIComponent(id.trim())}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `******`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({ payment_receiver: paymentReceiver }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Supabase DB Update Error (PATCH payment_receiver):', errorData)
      throw createError({
        statusCode: response.status,
        statusMessage: errorData.message || 'Failed to update payment receiver in Supabase database.',
      })
    }

    const updatedRows = await response.json()
    if (!Array.isArray(updatedRows) || updatedRows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: `Payment record '${id.trim()}' was not found in Supabase database.`,
      })
    }

    return { success: true, id: id.trim(), paymentReceiver }
  }
  catch (error: any) {
    console.error('Payment receiver update error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'An unexpected error occurred while updating payment receiver.',
    })
  }
})
