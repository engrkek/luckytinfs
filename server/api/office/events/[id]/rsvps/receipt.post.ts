import { blob, ensureBlob } from 'hub:blob'

export default defineEventHandler(async (event) => {
  await requireUserSession(event, { user: { role: ['admin'] } })

  const form = await readFormData(event)
  const file = form.get('receipt')

  if (!(file instanceof File) || !file.size) {
    throw createError({ statusCode: 400, statusMessage: 'Missing receipt' })
  }

  ensureBlob(file, { maxSize: '8MB', types: ['image', 'application/pdf'] })

  const receipt = await blob.put(file.name || 'receipt', file, {
    addRandomSuffix: true,
    prefix: 'receipts',
  })

  return { pathname: receipt.pathname }
})
