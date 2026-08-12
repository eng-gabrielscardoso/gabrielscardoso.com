import { describe, expect, it } from 'vitest'
import { validateContact } from '#shared/contact.schema'

describe('contact API validation (runtime)', () => {
  it('validates a complete submission payload', () => {
    const result = validateContact({
      name: 'Jane Doe',
      email: 'jane@example.com',
      subject: 'Collaboration',
      message: 'I would like to discuss a potential collaboration opportunity.',
    })

    expect(result.success).toBe(true)
  })

  it('blocks spam honeypot submissions', () => {
    const result = validateContact({
      name: 'Jane Doe',
      email: 'jane@example.com',
      subject: 'Collaboration',
      message: 'I would like to discuss a potential collaboration opportunity.',
      website: 'https://spam.example',
    })

    expect(result.success).toBe(false)
  })
})
