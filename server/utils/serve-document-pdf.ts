import type { H3Event } from 'h3'
import { queryCollection } from '@nuxt/content/nitro'
import type { Collections } from '@nuxt/content'
import { toDocumentBlocks } from '#shared/document-blocks'
import type { MinimarkTree } from '#shared/document-blocks'
import { siteConfig } from '#shared/site.config'
import { getCollectionName, getLocaleLanguageTag, documentRouteSlug, slugify } from '#shared/utils'
import type { CollectionBase, SupportedLocale } from '#shared/utils'

interface DocumentItem {
  title: string
  description?: string
  body?: MinimarkTree
}

/**
 * Typesets a content document as a PDF and serves it as a plain file, so `/cv.pdf` is something a
 * recruiter can bookmark, forward or open with curl — and so the download never depends on which
 * browser the visitor happens to be using.
 */
export async function serveDocumentPdf(
  event: H3Event,
  base: CollectionBase,
  locale: SupportedLocale,
) {
  const collection = getCollectionName(base, locale) as keyof Collections
  const document = (await queryCollection(event, collection).first()) as DocumentItem | null

  if (!document?.body) {
    throw createError({ statusCode: 404, statusMessage: 'Document not found' })
  }

  const filename = `${slugify(siteConfig.name)}-${documentRouteSlug(base)}.pdf`

  const pdf = await renderDocumentPdf(toDocumentBlocks(document.body), {
    author: siteConfig.name,
    title: document.title,
    subject: document.description,
    language: getLocaleLanguageTag(locale),
    layout: base === 'coverLetter' ? 'letter' : 'cv',
  })

  setHeader(event, 'content-type', 'application/pdf')
  // Inline so the URL previews in the browser; the download button names the file via `download`.
  setHeader(event, 'content-disposition', `inline; filename="${filename}"`)
  // The document only changes on deploy, so the CDN may serve it while it revalidates.
  setHeader(
    event,
    'cache-control',
    'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
  )

  return Buffer.from(pdf)
}
