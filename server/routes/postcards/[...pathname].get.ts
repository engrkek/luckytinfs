import { blob } from 'hub:blob'

/** Serves postcard photos: /postcards/abc.jpg → blob postcards/abc.jpg */
export default defineEventHandler(async (event) => {
  const pathname = getRouterParam(event, 'pathname')
  if (!pathname || pathname.includes('..')) {
    throw createError({ statusCode: 400, statusMessage: 'Bad pathname' })
  }
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
  return blob.serve(event, `postcards/${pathname}`)
})
