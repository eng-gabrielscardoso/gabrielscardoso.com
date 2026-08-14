export type SupportedLocale = 'en' | 'pt'

export const DEFAULT_LOCALE: SupportedLocale = 'en'

/** BCP 47 language tags used for HTML lang, SEO hreflang, and date formatting. */
export const LOCALE_LANGUAGE_TAGS: Record<SupportedLocale, string> = {
  en: 'en-GB',
  pt: 'pt-BR',
}

export type CollectionBase =
  | 'profile'
  | 'projects'
  | 'experiences'
  | 'education'
  | 'skills'
  | 'volunteering'
  | 'blog'
  | 'cv'
  | 'coverLetter'

/**
 * URL slug for a document collection. Collection names must be JS identifiers (no hyphens),
 * but public routes stay kebab-case.
 */
export function documentRouteSlug(base: CollectionBase): string {
  if (base === 'coverLetter') return 'cover-letter'
  return base
}

export function getCollectionName(base: CollectionBase, locale: SupportedLocale): string {
  return `${base}_${locale}`
}

export function getFallbackLocale(_locale: SupportedLocale): SupportedLocale {
  return DEFAULT_LOCALE
}

export function getLocaleLanguageTag(locale: SupportedLocale): string {
  return LOCALE_LANGUAGE_TAGS[locale]
}

/** Strips the `/pt` URL prefix so fallback queries can resolve the default-locale path. */
export function stripLocalePrefix(path: string): string {
  return path.replace(/^\/pt(?=\/|$)/, '') || '/'
}

export function formatDateRange(
  startDate: string,
  endDate: string | undefined | null,
  presentLabel = 'Present',
  locale: SupportedLocale = DEFAULT_LOCALE,
): string {
  const start = formatMonthYear(startDate, locale)
  const end = endDate ? formatMonthYear(endDate, locale) : presentLabel
  return `${start} — ${end}`
}

export function formatMonthYear(dateStr: string, locale: SupportedLocale = DEFAULT_LOCALE): string {
  const [year, month] = dateStr.split('-')
  const date = new Date(Number(year), Number(month) - 1)
  return date.toLocaleDateString(getLocaleLanguageTag(locale), { month: 'short', year: 'numeric' })
}

export function isActive(endDate: string | undefined | null): boolean {
  return !endDate
}

export type DatedEntry = {
  startDate: string
  endDate?: string | null
}

/** Sorts above any real date, so ongoing entries lead instead of trailing. */
const ONGOING_SORT_KEY = '9999-12'

/**
 * Orders timeline entries newest first: a missing `endDate` means the entry is still
 * running, so it outranks every finished one, and `startDate` breaks ties between
 * overlapping entries. Dates are zero-padded (`YYYY-MM`), so string comparison is enough.
 */
export function compareByRecency(a: DatedEntry, b: DatedEntry): number {
  const byEnd = (b.endDate || ONGOING_SORT_KEY).localeCompare(a.endDate || ONGOING_SORT_KEY)
  return byEnd !== 0 ? byEnd : b.startDate.localeCompare(a.startDate)
}

export function sortByRecency<T extends DatedEntry>(items: T[]): T[] {
  return [...items].sort(compareByRecency)
}

export function gravatarUrl(hash: string, size = 350): string {
  return `https://gravatar.com/avatar/${hash}?size=${size}`
}

/**
 * Removes the leading YAML front matter block so a downloaded Markdown file is the document
 * itself, without the metadata the site needs to render it.
 */
export function stripFrontmatter(markdown: string): string {
  return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---[^\S\r\n]*\r?\n?/, '').trimStart()
}

/**
 * Route of the server-generated PDF for a document, mirroring the i18n `prefix_except_default`
 * strategy so `/cv.pdf` and `/pt/cv.pdf` line up with `/cv` and `/pt/cv`.
 */
export function documentPdfPath(base: CollectionBase, locale: SupportedLocale): string {
  const slug = documentRouteSlug(base)
  return locale === DEFAULT_LOCALE ? `/${slug}.pdf` : `/${locale}/${slug}.pdf`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export const employmentTypeLabels: Record<string, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  self_employed: 'Self-employed',
  freelance: 'Freelance',
  contract: 'Contract',
  indirect_contract: 'Indirect contract',
  internship: 'Internship',
  apprenticeship: 'Apprenticeship',
  volunteer: 'Volunteer',
}

export const causeTypeLabels: Record<string, string> = {
  animal_welfare: 'Animal welfare',
  arts_and_culture: 'Arts and culture',
  children: 'Children',
  civil_rights: 'Civil rights',
  economic_empowerment: 'Economic empowerment',
  education: 'Education',
  environment: 'Environment',
  health: 'Health',
  human_rights: 'Human rights',
  politics: 'Politics',
  poverty_alleviation: 'Poverty alleviation',
  science_and_technology: 'Science and technology',
  social_services: 'Social services',
  veterans: 'Veterans',
  other: 'Other',
}
