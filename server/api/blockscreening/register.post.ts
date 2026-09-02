import { createError, defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Supabase Database Credentials (with environment variable override support)
  const supabaseUrl = process.env.NUXT_SUPABASE_URL || 'https://yqaforptbwlyfavadaky.supabase.co'
  const supabaseKey = process.env.NUXT_SUPABASE_KEY || 'sb_publishable_hHmRNH_QDvA8b05DmRaWpQ_TJVcQLtj'
  const tableName = process.env.NUXT_SUPABASE_TABLE_NAME || 'block_screening_registrations'

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

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/${tableName}`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Supabase DB Error Response:', errorData)

      // Gracefully handle "Table Not Found" 404 errors by referring to the SQL schema file
      if (response.status === 404) {
        throw createError({
          statusCode: 404,
          statusMessage: `Table '${tableName}' not found in your Supabase database. Please initialize the database schema by executing the 'supabase_schema.sql' file found at the root of your project repository within your Supabase SQL Editor.`,
        })
      }

      throw createError({
        statusCode: response.status,
        statusMessage: errorData.message || 'Failed to save registration to Supabase database.',
      })
    }

    return { success: true }
  }
  catch (error: any) {
    console.error('Registration API Error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'An unexpected error occurred during database registration.',
      data: error.data,
    })
  }
})
