import { blob, ensureBlob } from 'hub:blob'

export default defineEventHandler(async (event) => {
  const form = await readFormData(event)
  const file = form.get('photo')

  if (!(file instanceof File) || !file.size) {
    throw createError({ statusCode: 400, statusMessage: 'Missing photo' })
  }

  ensureBlob(file, { maxSize: '8MB', types: ['image'] })

  const photo = await blob.put(file.name || 'photo.jpg', file, {
    addRandomSuffix: true,
    prefix: 'postcards',
  })

  return { pathname: photo.pathname }
})
