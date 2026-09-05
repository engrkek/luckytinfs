import { createError, defineEventHandler, getHeader, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const adminPassword = process.env.BLOCKSCREENING_ADMIN_PASSWORD || 'luckytin02'
  if (getHeader(event, 'x-admin-password') !== adminPassword) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized. Please provide valid admin credentials.' })
  }

  const { id, childRegistration } = await readBody(event)
  if (!id || !childRegistration) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id or childRegistration in request payload.' })
  }

  const supabaseUrl = process.env.NUXT_SUPABASE_URL || 'https://yqaforptbwlyfavadaky.supabase.co'
  const supabaseKey = process.env.NUXT_SUPABASE_SERVICE_KEY || process.env.NUXT_SUPABASE_KEY || 'sb_publishable_hHmRNH_QDvA8b05DmRaWpQ_TJVcQLtj'
  const tableName = process.env.NUXT_SUPABASE_TABLE_NAME || 'block_screening_registrations'

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/${tableName}?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ child_registration: childRegistration }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Supabase DB Update Error (PATCH child_registration):', errorData)
      throw createError({
        statusCode: response.status,
        statusMessage: errorData.message || 'Failed to update seat option in Supabase database.',
      })
    }

    return { success: true, id, childRegistration }
  }
  catch (error: any) {
    console.error('Seat option update error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'An unexpected error occurred while updating seat option.',
    })
  }
})
