import { afterEach, describe, expect, it, vi } from 'vitest'
import { validateContact } from '#shared/contact.schema'

const validPayload = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  subject: 'Collaboration',
  message: 'I would like to discuss a potential collaboration opportunity.',
}

describe('contact API validation (runtime)', () => {
  it('validates a complete submission payload', () => {
    const result = validateContact(validPayload)

    expect(result.success).toBe(true)
  })

  it('blocks spam honeypot submissions', () => {
    const result = validateContact({
      ...validPayload,
      website: 'https://spam.example',
    })

    expect(result.success).toBe(false)
  })
})

const sendMock = vi.hoisted(() => vi.fn())

vi.mock('resend', () => ({
  Resend: class {
    emails = { send: sendMock }
  },
}))

async function loadHandler() {
  const setItem = vi.fn()

  vi.stubGlobal('defineEventHandler', (handler: unknown) => handler)
  vi.stubGlobal('readBody', vi.fn().mockResolvedValue(validPayload))
  vi.stubGlobal('getRequestIP', vi.fn().mockReturnValue('127.0.0.1'))
  vi.stubGlobal(
    'useStorage',
    vi.fn().mockReturnValue({ getItem: vi.fn().mockResolvedValue(null), setItem }),
  )
  vi.stubGlobal(
    'useRuntimeConfig',
    vi.fn().mockReturnValue({
      resendApiKey: 'test-key',
      contactEmail: 'owner@example.com',
      contactFromEmail: 'noreply@example.com',
      contactRateLimitSeconds: 3600,
    }),
  )
  vi.stubGlobal('createError', (input: { statusCode: number; statusMessage?: string }) =>
    Object.assign(new Error(input.statusMessage), input),
  )

  const { default: handler } = await import('../../server/api/contact.post')
  return { handler: handler as unknown as (event: unknown) => Promise<unknown>, setItem }
}

describe('contact API handler (runtime)', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    sendMock.mockReset()
  })

  it('returns success and records the rate limit when Resend accepts the email', async () => {
    sendMock.mockResolvedValue({ data: { id: 'email-id' }, error: null })
    const { handler, setItem } = await loadHandler()

    await expect(handler({})).resolves.toEqual({ success: true })
    expect(setItem).toHaveBeenCalledOnce()
  })

  it('throws 502 and skips the rate limit when Resend resolves with an error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    sendMock.mockResolvedValue({
      data: null,
      error: { statusCode: 401, name: 'validation_error', message: 'API key is invalid' },
    })
    const { handler, setItem } = await loadHandler()

    await expect(handler({})).rejects.toMatchObject({ statusCode: 502 })
    expect(setItem).not.toHaveBeenCalled()
  })
})
