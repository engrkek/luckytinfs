export default defineEventHandler(async (event) => {
  requireBlockscreeningAdmin(event)

  const { id, paid } = await readBody(event)
  if (!id || typeof paid !== 'boolean') {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid id / paid status in request payload.' })
  }

  const { registrations } = blockscreeningTables(event)
  const response = await blockscreeningSupabaseFetch(event, `${registrations}?id=eq.${id}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ paid }),
  })

  if (!response.ok) {
    await throwSupabaseError(response, 'Failed to update payment status in database.', 'Supabase DB Update Error (PATCH paid):')
  }

  return { success: true, id, paid }
})
