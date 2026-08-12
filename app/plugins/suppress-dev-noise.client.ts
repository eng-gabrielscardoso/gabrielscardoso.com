import { isDevNoisePath, isServerManagedPath } from '#shared/dev-noise'

function resolvePath(location: unknown): string {
  if (typeof location === 'string') return location
  if (typeof location === 'object' && location !== null && 'path' in location) {
    return String((location as { path?: string }).path ?? '')
  }
  return ''
}

export default defineNuxtPlugin(() => {
  if (!import.meta.dev) return

  const router = useRouter()

  const originalPush = router.push.bind(router)
  const originalReplace = router.replace.bind(router)

  router.push = ((location: unknown) => {
    const path = resolvePath(location)

    if (shouldIgnoreNavigation(path)) {
      if (isServerManagedPath(path)) {
        window.location.assign(path)
      }
      return Promise.resolve()
    }

    return originalPush(location as Parameters<typeof originalPush>[0])
  }) as typeof router.push

  router.replace = ((location: unknown) => {
    const path = resolvePath(location)

    if (shouldIgnoreNavigation(path)) {
      if (isServerManagedPath(path)) {
        window.location.assign(path)
      }
      return Promise.resolve()
    }

    return originalReplace(location as Parameters<typeof originalReplace>[0])
  }) as typeof router.replace

  router.beforeEach((to) => {
    if (isDevNoisePath(to.path)) {
      return false
    }

    if (isServerManagedPath(to.path)) {
      window.location.assign(to.fullPath)
      return false
    }
  })
})

function shouldIgnoreNavigation(path: string): boolean {
  return isDevNoisePath(path) || isServerManagedPath(path)
}
