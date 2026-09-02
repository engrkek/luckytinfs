import { createError, defineEventHandler, getHeader, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const adminPassword = process.env.BLOCKSCREENING_ADMIN_PASSWORD || 'luckytin02'
  const headerPassword = getHeader(event, 'x-admin-password')
  const query = getQuery(event)
  const queryPassword = query.password as string

  if (headerPassword !== adminPassword && queryPassword !== adminPassword) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized. Please provide a valid block screening admin password.',
    })
  }

  // Supabase Database Credentials (with environment variable override support)
  const supabaseUrl = process.env.NUXT_SUPABASE_URL || 'https://yqaforptbwlyfavadaky.supabase.co'
  // Use service key if available, fallback to the standard key
  const supabaseKey = process.env.NUXT_SUPABASE_SERVICE_KEY || process.env.NUXT_SUPABASE_KEY || 'sb_publishable_hHmRNH_QDvA8b05DmRaWpQ_TJVcQLtj'
  const tableName = process.env.NUXT_SUPABASE_TABLE_NAME || 'block_screening_registrations'

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/${tableName}?select=*&order=created_at.desc`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Supabase DB Error Response (GET registrations):', errorData)

      if (response.status === 404) {
        throw createError({
          statusCode: 404,
          statusMessage: `Table '${tableName}' not found in your Supabase database. Please ensure migrations/schemas are fully applied.`,
        })
      }

      throw createError({
        statusCode: response.status,
        statusMessage: errorData.message || 'Failed to fetch registrations from Supabase database.',
      })
    }

    const data = await response.json()

    // Map lower_snake_case columns to camelCase matching blockscreening.vue form
    const registrations = data.map((row: any) => ({
      id: row.id,
      fullName: row.full_name,
      nickname: row.nickname,
      email: row.email,
      mobile: row.mobile,
      primaryPlatform: row.primary_platform,
      primaryUsername: row.primary_username,
      otherPlatform: row.other_platform || '',
      otherUsername: row.other_username || '',
      childRegistration: row.child_registration,
      minorName: row.minor_name || '',
      relationship: row.relationship || '',
      paid: Boolean(row.paid),
      createdAt: row.created_at,
    }))

    return { registrations }
  }
  catch (error: any) {
    console.error('Registrations GET API Error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'An unexpected error occurred while fetching registrations.',
    })
  }
})
