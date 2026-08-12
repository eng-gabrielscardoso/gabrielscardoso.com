import { isDevNoisePath } from '#shared/dev-noise'

export default defineEventHandler((event) => {
  if (!import.meta.dev) return

  const { pathname } = getRequestURL(event)

  if (isDevNoisePath(pathname)) {
    setResponseStatus(event, 404)
    return null
  }
})
