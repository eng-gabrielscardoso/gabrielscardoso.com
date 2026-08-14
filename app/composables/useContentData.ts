import { DEFAULT_LOCALE, getCollectionName } from '#shared/utils'
import type { SupportedLocale } from '#shared/utils'
import type { Collections } from '@nuxt/content'
import type { z } from 'zod'
import type { blogSchema, documentSchema, projectSchema } from '#shared/content-schemas'

export type BlogPost = z.infer<typeof blogSchema> & { path: string }
export type ProjectPage = z.infer<typeof projectSchema> & { path: string; description?: string }
export type DocumentPage = z.infer<typeof documentSchema> & { path: string }

export type Profile = {
  headline: string
  location: string
  biography: string
  translated?: boolean
}

export async function useProfile(): Promise<Profile | null> {
  const { locale } = useI18n()
  const collection = getCollectionName('profile', locale.value as SupportedLocale)
  const fallback = getCollectionName('profile', DEFAULT_LOCALE)

  let profile = await queryCollection(collection as keyof Collections).first()

  if (!profile && collection !== fallback) {
    profile = await queryCollection(fallback as keyof Collections).first()
  }

  return profile as Profile | null
}

export async function useContentItems<T>(base: Parameters<typeof getCollectionName>[0]) {
  const { locale } = useI18n()
  const collection = getCollectionName(base, locale.value as SupportedLocale)
  const fallback = getCollectionName(base, DEFAULT_LOCALE)

  let items = (await queryCollection(collection as keyof Collections).all()) as T[]

  if (items.length === 0 && collection !== fallback) {
    items = (await queryCollection(fallback as keyof Collections).all()) as T[]
  }

  return items
}
