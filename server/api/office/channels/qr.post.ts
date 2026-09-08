import { blob, ensureBlob } from 'hub:blob'

export default defineEventHandler(async (event) => {
  await requireUserSession(event, { user: { role: ['admin'] } })

  const form = await readFormData(event)
  const file = form.get('qr')

  if (!(file instanceof File) || !file.size) {
    throw createError({ statusCode: 400, statusMessage: 'Missing QR image' })
  }

  ensureBlob(file, { maxSize: '8MB', types: ['image'] })

  const qr = await blob.put(file.name || 'qr', file, {
    addRandomSuffix: true,
    prefix: 'channels',
  })

  return { pathname: qr.pathname }
})
