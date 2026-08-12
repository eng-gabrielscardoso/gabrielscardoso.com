import { defineCollection, defineContentConfig } from '@nuxt/content'
import type { ZodTypeAny } from 'zod'
import {
  blogSchema,
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

function defineLocaleCollections(name: string, type: 'page' | 'data', schema: ZodTypeAny) {
  return {
    [`${name}_en`]: defineCollection({
      type,
      source: {
        include: `en/${name}/**`,
        exclude: excludedSources,
        prefix: type === 'page' ? `/${name === 'blog' ? 'blog' : 'projects'}` : undefined,
      },
      schema,
    }),
    [`${name}_pt`]: defineCollection({
      type,
      source: {
        include: `pt/${name}/**`,
        exclude: excludedSources,
        prefix: type === 'page' ? `/pt/${name === 'blog' ? 'blog' : 'projects'}` : undefined,
      },
      schema,
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
  },
})
