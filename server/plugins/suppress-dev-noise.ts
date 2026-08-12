import { isDevNoisePath, isServerManagedPath } from '#shared/dev-noise'

export default defineNitroPlugin(() => {
  if (!import.meta.dev) return

  const originalWarn = console.warn

  console.warn = (...args: unknown[]) => {
    const message = args.map(String).join(' ')

    if (message.includes('[VUE_ROUTER_R0004]')) {
      const pathMatch = message.match(/path "([^"]+)"/)
      const path = pathMatch?.[1] ?? ''

      if (isDevNoisePath(path) || isServerManagedPath(path)) {
        return
      }
    }

    originalWarn(...args)
  }
})
