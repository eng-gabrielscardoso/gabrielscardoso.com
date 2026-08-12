import { z } from 'zod'

export const employmentTypeSchema = z.enum([
  'full_time',
  'part_time',
  'self_employed',
  'freelance',
  'contract',
  'indirect_contract',
  'internship',
  'apprenticeship',
  'volunteer',
])

export const causeTypeSchema = z.enum([
  'animal_welfare',
  'arts_and_culture',
  'children',
  'civil_rights',
  'economic_empowerment',
  'education',
  'environment',
  'health',
  'human_rights',
  'politics',
  'poverty_alleviation',
  'science_and_technology',
  'social_services',
  'veterans',
  'other',
])

/**
 * Only localised copy lives here. Names, links, avatar and donation addresses are
 * defined once in `shared/site.config.ts`.
 */
export const profileSchema = z.object({
  headline: z.string(),
  location: z.string(),
  biography: z.string(),
  translated: z.boolean().optional(),
})

export const projectSchema = z.object({
  title: z.string(),
  association: z.string(),
  link: z.string().url().optional(),
  image: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  featured: z.boolean().optional(),
  translated: z.boolean().optional(),
})

export const experienceSchema = z.object({
  title: z.string(),
  company: z.string(),
  employmentType: employmentTypeSchema,
  location: z.string(),
  description: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  translated: z.boolean().optional(),
})

export const educationSchema = z.object({
  degree: z.string(),
  course: z.string(),
  fieldOfStudy: z.string().optional(),
  school: z.string(),
  description: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  translated: z.boolean().optional(),
})

export const skillSchema = z.object({
  name: z.string(),
  description: z.string(),
  icons: z.preprocess((value) => {
    if (value == null || value === '') return []
    if (Array.isArray(value)) return value
    if (typeof value === 'string') {
      return value
        .split(/[,\n]/)
        .map((icon) => icon.trim())
        .filter(Boolean)
    }
    return []
  }, z.array(z.string())),
  translated: z.boolean().optional(),
})

export const volunteeringSchema = z.object({
  role: z.string(),
  organisation: z.string(),
  cause: causeTypeSchema,
  description: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  translated: z.boolean().optional(),
})

export const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.string(),
  tags: z.array(z.string()).optional(),
  translated: z.boolean().optional(),
})
