import { describe, expect, it } from 'vitest'
import { contactSchema, validateContact } from '#shared/contact.schema'

describe('contact schema', () => {
  it('validates correct contact data', () => {
    const result = validateContact({
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Hello',
      message: 'This is a test message with enough length.',
    })

    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = validateContact({
      name: 'John Doe',
      email: 'not-an-email',
      subject: 'Hello',
      message: 'This is a test message with enough length.',
    })

    expect(result.success).toBe(false)
  })

  it('rejects short message', () => {
    const result = validateContact({
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Hello',
      message: 'Short',
    })

    expect(result.success).toBe(false)
  })

  it('rejects honeypot field', () => {
    const result = contactSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Hello',
      message: 'This is a test message with enough length.',
      website: 'spam',
    })

    expect(result.success).toBe(false)
  })
})
