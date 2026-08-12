/** Paths requested by browser extensions / devtools that are not app routes. */
export function isDevNoisePath(path: string): boolean {
  return path.endsWith('.map') || /installHook/i.test(path)
}

/** Server-only routes handled outside Vue Router (Nuxt Studio, etc.). */
export function isServerManagedPath(path: string): boolean {
  return path === '/_studio' || path.startsWith('/__nuxt_studio')
}
