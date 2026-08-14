import { defineCollection, defineContentConfig } from '@nuxt/content'
import { defineSitemapSchema } from '@nuxtjs/sitemap/content'
import { z } from 'zod'
import type { ZodObject, ZodRawShape, ZodTypeAny } from 'zod'
import {
  blogSchema,
  documentSchema,
  educationSchema,
  experienceSchema,
  profileSchema,
  projectSchema,
  skillSchema,
  volunteeringSchema,
} from './shared/content-schemas'

/**
 * `_*` keeps the `_example` templates out of the site, `.gitkeep` silences the
 * "files are not supported" warnings from placeholder files.
 */
const excludedSources = ['**/_*', '**/.gitkeep']

function defineLocaleCollections(
  name: string,
  type: 'page' | 'data',
  schema: ZodObject<ZodRawShape>,
  options?: {
    /** Folder under `content/{locale}/` when it differs from the collection name. */
    sourceDir?: string
    /** Public path prefix (without locale), e.g. `/cover-letter`. Defaults to `/${name}`. */
    routePrefix?: string
  },
) {
  // The `sitemap` schema field is what registers a page collection with @nuxtjs/sitemap.
  const collectionSchema =
    type === 'page' ? schema.extend({ sitemap: defineSitemapSchema({ z }) }) : schema
  const sourceDir = options?.sourceDir ?? name
  const routePrefix = options?.routePrefix ?? `/${name}`

  return {
    [`${name}_en`]: defineCollection({
      type,
      source: {
        include: `en/${sourceDir}/**`,
        exclude: excludedSources,
        prefix: type === 'page' ? routePrefix : undefined,
      },
      schema: collectionSchema,
    }),
    [`${name}_pt`]: defineCollection({
      type,
      source: {
        include: `pt/${sourceDir}/**`,
        exclude: excludedSources,
        prefix: type === 'page' ? `/pt${routePrefix}` : undefined,
      },
      schema: collectionSchema,
    }),
  }
}

function defineProfileCollections() {
  return {
    profile_en: defineCollection({
      type: 'data',
      source: {
        include: 'en/profile.yml',
      },
      schema: profileSchema,
    }),
    profile_pt: defineCollection({
      type: 'data',
      source: {
        include: 'pt/profile.yml',
      },
      schema: profileSchema,
    }),
  }
}

function defineDataCollections(name: string, schema: ZodTypeAny) {
  return {
    [`${name}_en`]: defineCollection({
      type: 'data',
      source: {
        include: `en/${name}/**`,
        exclude: excludedSources,
      },
      schema,
    }),
    [`${name}_pt`]: defineCollection({
      type: 'data',
      source: {
        include: `pt/${name}/**`,
        exclude: excludedSources,
      },
      schema,
    }),
  }
}

export default defineContentConfig({
  collections: {
    ...defineProfileCollections(),
    ...defineLocaleCollections('projects', 'page', projectSchema),
    ...defineDataCollections('experiences', experienceSchema),
    ...defineDataCollections('education', educationSchema),
    ...defineDataCollections('skills', skillSchema),
    ...defineDataCollections('volunteering', volunteeringSchema),
    ...defineLocaleCollections('blog', 'page', blogSchema),
    // A single `index.md` per locale, so the collection resolves to `/cv` and `/pt/cv`.
    ...defineLocaleCollections('cv', 'page', documentSchema),
    // Collection name must be a JS identifier; the public path stays kebab-case.
    ...defineLocaleCollections('coverLetter', 'page', documentSchema, {
      sourceDir: 'cover-letter',
      routePrefix: '/cover-letter',
    }),
  },
})
