import { createError, defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { id, paymentMode, paymentReference } = body

  // Validation
  if (!id || typeof id !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Registration/Pass ID is required.',
    })
  }

  if (!paymentMode || !Array.isArray(paymentMode) || paymentMode.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'At least one Mode of Payment must be selected.',
    })
  }

  if (!paymentReference || typeof paymentReference !== 'string' || !paymentReference.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Payment Reference Number is required.',
    })
  }

  // Supabase Database Credentials (with environment variable override support)
  const supabaseUrl = process.env.NUXT_SUPABASE_URL || 'https://yqaforptbwlyfavadaky.supabase.co'
  const supabaseKey = process.env.NUXT_SUPABASE_KEY || 'sb_publishable_hHmRNH_QDvA8b05DmRaWpQ_TJVcQLtj'
  const registrationsTable = process.env.NUXT_SUPABASE_TABLE_NAME || 'block_screening_registrations'
  const paymentsTable = 'block_screening_payments'

  try {
    // 1. Validate if the Registration/Pass ID exists in registrations table
    const checkResponse = await fetch(`${supabaseUrl}/rest/v1/${registrationsTable}?id=eq.${encodeURIComponent(id)}&select=id,full_name,nickname`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!checkResponse.ok) {
      const errorData = await checkResponse.json().catch(() => ({}))
      console.error('Supabase registration verification failed:', errorData)
      throw createError({
        statusCode: checkResponse.status,
        statusMessage: errorData.message || 'Failed to verify the registration ID.',
      })
    }

    const rows = await checkResponse.json()
    if (!rows || rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: `Registration/Pass ID '${id}' was not found. Please double-check your ID or register first.`,
      })
    }

    const registrant = rows[0]

    // 2. Perform upsert into the new block_screening_payments table
    const payload = {
      id: id.trim().toUpperCase(),
      payment_mode: paymentMode.join(', '),
      payment_reference: paymentReference.trim(),
    }

    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/${paymentsTable}`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify(payload),
    })

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json().catch(() => ({}))
      console.error('Supabase payment insert/upsert failed:', errorData)
      throw createError({
        statusCode: updateResponse.status,
        statusMessage: errorData.message || 'Failed to register the payment reference in the database.',
      })
    }

    return {
      success: true,
      fullName: registrant.full_name,
      nickname: registrant.nickname,
    }
  }
  catch (error: any) {
    console.error('Payment API Error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'An unexpected database error occurred during payment submission.',
      data: error.data,
    })
  }
})
