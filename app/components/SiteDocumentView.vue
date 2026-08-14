<script setup lang="ts">
import { siteConfig } from '#shared/site.config'
import type { SiteDocument } from '#shared/site.config'
import {
  documentPdfPath,
  documentRouteSlug,
  formatMonthYear,
  slugify,
  stripFrontmatter,
} from '#shared/utils'
import type { CollectionBase, SupportedLocale } from '#shared/utils'

const props = defineProps<{
  /** Content collection that backs this page, e.g. `cv` or `coverLetter`. */
  collection: CollectionBase
  /** i18n key for the page eyebrow and document title, e.g. `nav.cv`. */
  labelKey: string
  /** Basename for downloaded files, without extension. Defaults to the slugified site name. */
  filename?: string
  /** Optional cross-link to the sibling document (CV ↔ cover letter). */
  related?: SiteDocument
  /** i18n key for the sentence introducing the related document. */
  relatedHintKey?: string
}>()

const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()

const { data: document } = await useAsyncData(
  `document-${props.collection}-${route.path}`,
  () => queryLocalePage<DocumentPage, typeof props.collection>(props.collection, route.path),
  { watch: [locale] },
)

if (!document.value) {
  throw createError({ statusCode: 404, statusMessage: 'Document not found' })
}

const markdown = computed(() => stripFrontmatter(document.value?.rawbody ?? ''))
const filename = computed(
  () => props.filename ?? `${slugify(siteConfig.name)}-${documentRouteSlug(props.collection)}`,
)
const pdfPath = computed(() => documentPdfPath(props.collection, locale.value as SupportedLocale))
const updatedAt = computed(() =>
  document.value ? formatMonthYear(document.value.updatedAt, locale.value as SupportedLocale) : '',
)
const documentTitle = computed(() => `${t(props.labelKey)} — ${siteConfig.name}`)
const relatedTo = computed(() => {
  if (!props.related?.to) return props.related?.href
  return localePath(props.related.to)
})
const relatedExternal = computed(() => !props.related?.to)

useSeoMeta({
  title: () => documentTitle.value,
  description: () => document.value?.description,
})

useSchemaOrg([
  defineBreadcrumb({
    itemListElement: [{ name: t('nav.home'), item: localePath('/') }, { name: t(props.labelKey) }],
  }),
])
</script>

<template>
  <div v-if="document" class="py-12 print:py-0">
    <UContainer class="max-w-3xl print:max-w-none print:px-0">
      <div
        class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between print:hidden"
      >
        <div>
          <p class="text-xs font-semibold tracking-widest text-green-400 uppercase">
            {{ t(labelKey) }}
          </p>
          <p class="mt-2 text-sm text-neutral-500">
            {{ t('document.updated', { date: updatedAt }) }}
          </p>
        </div>

        <DocumentActions
          :markdown="markdown"
          :pdf-path="pdfPath"
          :filename="filename"
          :document-title="documentTitle"
        />
      </div>

      <article
        class="glass rounded-xl p-6 sm:p-10 print:rounded-none print:border-0 print:bg-transparent print:p-0 print:backdrop-blur-none"
        :class="collection === 'coverLetter' ? 'letter-document' : 'cv-document'"
      >
        <div
          class="prose prose-invert max-w-none"
          :class="collection === 'coverLetter' ? 'letter-prose' : undefined"
        >
          <ContentRenderer :value="document" />
        </div>
      </article>

      <p
        v-if="related && relatedTo && relatedHintKey"
        class="mt-8 text-sm text-neutral-500 print:hidden"
      >
        {{ t(relatedHintKey) }}
        <NuxtLink
          :to="relatedTo"
          :target="relatedExternal ? '_blank' : undefined"
          class="text-green-400 transition-colors hover:text-green-300"
        >
          {{ t(related.labelKey) }}
          <UIcon
            v-if="relatedExternal"
            name="i-lucide-external-link"
            class="inline size-3.5 align-text-bottom"
          />
        </NuxtLink>
      </p>
    </UContainer>
  </div>
</template>
