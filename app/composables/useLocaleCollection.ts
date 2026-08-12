import type { CollectionBase, SupportedLocale } from '#shared/utils'
import { DEFAULT_LOCALE, getCollectionName, stripLocalePrefix } from '#shared/utils'

type LocaleCollectionName<B extends CollectionBase> = `${B}_en` | `${B}_pt`

export function useLocaleCollection(base: CollectionBase) {
  const { locale } = useI18n()

  const collectionName = computed(() => getCollectionName(base, locale.value as SupportedLocale))

  const fallbackCollectionName = computed(() => getCollectionName(base, DEFAULT_LOCALE))

  return {
    locale,
    collectionName,
    fallbackCollectionName,
  }
}

export async function queryLocaleCollection<T, B extends CollectionBase>(
  base: B,
  queryFn: (collection: LocaleCollectionName<B>) => Promise<T[]>,
): Promise<T[]> {
  const { locale } = useI18n()
  const collection = getCollectionName(
    base,
    locale.value as SupportedLocale,
  ) as LocaleCollectionName<B>
  const fallback = getCollectionName(base, DEFAULT_LOCALE) as LocaleCollectionName<B>

  let results = await queryFn(collection)

  if (results.length === 0 && collection !== fallback) {
    results = await queryFn(fallback)
  }

  return results
}

export async function queryLocalePage<T, B extends CollectionBase>(
  base: B,
  path: string,
): Promise<T | null> {
  const { locale } = useI18n()
  const collection = getCollectionName(
    base,
    locale.value as SupportedLocale,
  ) as LocaleCollectionName<B>
  const fallback = getCollectionName(base, DEFAULT_LOCALE) as LocaleCollectionName<B>

  let result = (await queryCollection(collection).path(path).first()) as T | null

  if (!result && collection !== fallback) {
    result = (await queryCollection(fallback).path(stripLocalePrefix(path)).first()) as T | null
  }

  return result
}
