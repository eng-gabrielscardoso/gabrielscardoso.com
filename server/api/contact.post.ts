import { Resend } from 'resend'
import { validateContact } from '#shared/contact.schema'
import { siteConfig } from '#shared/site.config'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const validation = validateContact(body)
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.error.issues[0]?.message || 'Validation failed',
    })
  }

  if (validation.data.website) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid submission' })
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const storage = useStorage('rateLimit')
  const rateLimitKey = `contact:${ip}`

  const existing = await storage.getItem<number>(rateLimitKey)
  if (existing) {
    throw createError({
      statusCode: 429,
      statusMessage: 'You can only send one message per hour. Please try again later.',
    })
  }

  if (!config.resendApiKey || !config.contactEmail || !config.contactFromEmail) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Contact form is not configured',
    })
  }

  const resend = new Resend(config.resendApiKey)

  const { name, email, subject, message } = validation.data

  // The Resend SDK reports API failures by resolving with `error` instead
  // of throwing, and only logs them itself outside production.
  const { error } = await resend.emails.send({
    from: `${siteConfig.name} <${config.contactFromEmail}>`,
    to: config.contactEmail,
    replyTo: email,
    subject: `[Portfolio] ${subject}`,
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
  })

  if (error) {
    console.error('[contact] Resend send failed:', error)
    throw createError({
      statusCode: 502,
      statusMessage: 'Email delivery failed',
    })
  }

  await storage.setItem(rateLimitKey, Date.now(), {
    ttl: config.contactRateLimitSeconds,
  })

  return { success: true }
})
