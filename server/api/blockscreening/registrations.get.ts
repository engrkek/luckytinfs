export default defineEventHandler(async (event) => {
  requireBlockscreeningAdmin(event)

  const { registrations: registrationsTable, payments: paymentsTable } = blockscreeningTables(event)
  const [regResponse, payResponse] = await Promise.all([
    blockscreeningSupabaseFetch(event, `${registrationsTable}?select=*&order=created_at.desc`),
    blockscreeningSupabaseFetch(event, `${paymentsTable}?select=id,payment_mode,payment_reference,payment_receiver`),
  ])

  if (!regResponse.ok) {
    if (regResponse.status === 404) {
      throw createError({ statusCode: 404, statusMessage: `Table '${registrationsTable}' not found in your database.` })
    }
    await throwSupabaseError(regResponse, 'Failed to fetch registrations from database.', 'DB Error Response (GET registrations):')
  }
  if (!payResponse.ok) {
    await throwSupabaseError(payResponse, 'Failed to fetch payment details from database.', 'DB Error Response (GET payments):')
  }

  const regData = await regResponse.json()
  const payData = await payResponse.json()

  // Payments use the registration ID as their primary key, so only join on payment.id.
  const paymentsMap = new Map<string, any>()
  if (Array.isArray(payData)) {
    payData.forEach((pay: any) => {
      if (pay.id) {
        paymentsMap.set(String(pay.id).trim(), pay)
      }
    })
  }

  const registrations = regData.map((row: any) => {
    const matchedPayment = paymentsMap.get(String(row.id).trim())

    return {
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
      paymentReference: matchedPayment?.payment_reference || null,
      paymentMode: matchedPayment?.payment_mode || null,
      paymentReceiver: matchedPayment?.payment_receiver || null,
      paymentAmount: matchedPayment?.amount || null,
      hasPaymentEntry: Boolean(matchedPayment),
      createdAt: row.created_at,
    }
  })

  return { registrations }
})
