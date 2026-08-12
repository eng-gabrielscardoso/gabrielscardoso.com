import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.email('Invalid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
  website: z.string().max(0, 'Invalid submission').optional(),
})

export type ContactFormData = z.infer<typeof contactSchema>

export function validateContact(data: unknown) {
  return contactSchema.safeParse(data)
}
