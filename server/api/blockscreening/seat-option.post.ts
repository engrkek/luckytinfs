export default defineEventHandler(async (event) => {
  requireBlockscreeningAdmin(event)

  const { id, childRegistration } = await readBody(event)
  if (!id || !childRegistration) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id or childRegistration in request payload.' })
  }

  const response = await blockscreeningSupabaseFetch(`${BLOCKSCREENING_REGISTRATIONS_TABLE}?id=eq.${id}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ child_registration: childRegistration }),
  })

  if (!response.ok) {
    await throwSupabaseError(response, 'Failed to update seat option in database.', 'DB Update Error (PATCH child_registration):')
  }

  return { success: true, id, childRegistration }
})
