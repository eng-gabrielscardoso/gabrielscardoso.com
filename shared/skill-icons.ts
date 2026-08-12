/**
 * Normalizes skill icon slugs from content/Studio to valid Iconify `logos` names.
 * Search slugs at https://icones.js.org/collection/logos
 */
const skillIconAliases: Record<string, string> = {
  gcp: 'google-cloud',
  hardhat: 'hardhat-icon',
}

/** Slugs with no matching icon in the `logos` collection — skipped silently. */
const unsupportedSkillIcons = new Set(['uv', 'fiber', 'foundry'])

export function resolveSkillIconSlug(slug: string): string | null {
  const trimmed = slug.trim()
  if (!trimmed) return null

  const resolved = skillIconAliases[trimmed] ?? trimmed
  if (unsupportedSkillIcons.has(resolved)) return null

  return resolved
}

export function normalizeSkillIcons(icons: string[] | string | undefined | null): string[] {
  if (!icons) return []

  const list = Array.isArray(icons) ? icons : icons.split(/[,\n]/)
  const normalized = list
    .map((icon) => resolveSkillIconSlug(icon))
    .filter((icon): icon is string => Boolean(icon))

  return [...new Set(normalized)]
}
