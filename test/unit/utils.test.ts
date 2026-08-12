import { describe, expect, it } from 'vitest'
import {
  DEFAULT_LOCALE,
  formatDateRange,
  formatMonthYear,
  getCollectionName,
  getFallbackLocale,
  getLocaleLanguageTag,
  gravatarUrl,
  isActive,
  slugify,
  sortByRecency,
  stripLocalePrefix,
} from '#shared/utils'

describe('shared utils', () => {
  it('formats month and year', () => {
    expect(formatMonthYear('2024-01')).toBe('Jan 2024')
  })

  it('formats date range with present label', () => {
    expect(formatDateRange('2023-01', undefined, 'Present')).toBe('Jan 2023 — Present')
    expect(formatDateRange('2021-06', '2022-12', 'Present')).toBe('Jun 2021 — Dec 2022')
  })

  it('detects active items', () => {
    expect(isActive(undefined)).toBe(true)
    expect(isActive(null)).toBe(true)
    expect(isActive('2024-01')).toBe(false)
  })

  it('builds gravatar url', () => {
    expect(gravatarUrl('abc123', 200)).toBe('https://gravatar.com/avatar/abc123?size=200')
  })

  it('slugifies text', () => {
    expect(slugify('Hello World!')).toBe('hello-world')
  })

  it('returns locale collection names', () => {
    expect(getCollectionName('projects', 'en')).toBe('projects_en')
    expect(getCollectionName('blog', 'pt')).toBe('blog_pt')
  })

  it('maps locale codes to BCP 47 language tags', () => {
    expect(getLocaleLanguageTag('en')).toBe('en-GB')
    expect(getLocaleLanguageTag('pt')).toBe('pt-BR')
  })

  it('falls back to the default locale', () => {
    expect(getFallbackLocale('pt')).toBe(DEFAULT_LOCALE)
  })

  it('strips the portuguese URL prefix for fallback paths', () => {
    expect(stripLocalePrefix('/pt/blog/post')).toBe('/blog/post')
    expect(stripLocalePrefix('/blog/post')).toBe('/blog/post')
  })

  describe('sortByRecency', () => {
    it('orders finished entries from newest to oldest end date', () => {
      const sorted = sortByRecency([
        { id: 'old', startDate: '2019-01', endDate: '2020-06' },
        { id: 'recent', startDate: '2023-01', endDate: '2024-04' },
        { id: 'middle', startDate: '2021-03', endDate: '2022-11' },
      ])

      expect(sorted.map((item) => item.id)).toEqual(['recent', 'middle', 'old'])
    })

    it('puts ongoing entries first regardless of when they started', () => {
      const sorted = sortByRecency([
        { id: 'finished', startDate: '2023-01', endDate: '2024-04' },
        { id: 'ongoing', startDate: '2018-05', endDate: null },
      ])

      expect(sorted.map((item) => item.id)).toEqual(['ongoing', 'finished'])
    })

    it('breaks ties on the same end date using the start date', () => {
      const sorted = sortByRecency([
        { id: 'shorter', startDate: '2023-06', endDate: '2024-04' },
        { id: 'longer', startDate: '2022-01', endDate: '2024-04' },
      ])

      expect(sorted.map((item) => item.id)).toEqual(['shorter', 'longer'])
    })

    it('does not mutate the original array', () => {
      const items = [
        { id: 'a', startDate: '2019-01', endDate: '2020-06' },
        { id: 'b', startDate: '2023-01', endDate: '2024-04' },
      ]

      sortByRecency(items)

      expect(items.map((item) => item.id)).toEqual(['a', 'b'])
    })
  })
})
