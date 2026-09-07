import { blob, ensureBlob } from 'hub:blob'

export default defineEventHandler(async (event) => {
  const form = await readFormData(event)
  const file = form.get('proof')

  if (!(file instanceof File) || !file.size) {
    throw createError({ statusCode: 400, statusMessage: 'Missing proof' })
  }

  ensureBlob(file, { maxSize: '8MB', types: ['image', 'application/pdf'] })

  const proof = await blob.put(file.name || 'proof', file, {
    addRandomSuffix: true,
    prefix: 'donations',
  })

  return { pathname: proof.pathname }
})
