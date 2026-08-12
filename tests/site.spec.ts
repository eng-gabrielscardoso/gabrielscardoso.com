import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@nuxt/test-utils/playwright'

const pages = ['/', '/about', '/projects', '/blog', '/contact']

for (const path of pages) {
  test(`english page ${path} loads and is accessible`, async ({ page, goto }) => {
    await goto(path, { waitUntil: 'hydration' })
    await expect(page.locator('h1').first()).toBeVisible()

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    const seriousViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    )
    expect(seriousViolations).toEqual([])
  })
}

for (const path of pages) {
  test(`portuguese page /pt${path === '/' ? '' : path} loads`, async ({ page, goto }) => {
    const ptPath = path === '/' ? '/pt' : `/pt${path}`
    await goto(ptPath, { waitUntil: 'hydration' })
    await expect(page.locator('h1').first()).toBeVisible()
  })
}

test('contact API rejects invalid payload', async ({ request }) => {
  const response = await request.post('/api/contact', {
    data: { name: 'A', email: 'bad', subject: 'Hi', message: 'Short' },
  })
  expect(response.status()).toBe(400)
})

test('sitemap is available', async ({ request }) => {
  const response = await request.get('/sitemap.xml')
  expect(response.status()).toBe(200)
  const body = await response.text()
  expect(body).toMatch(/sitemapindex|urlset/)
})

test('robots.txt is available', async ({ request }) => {
  const response = await request.get('/robots.txt')
  expect(response.status()).toBe(200)
})

test('contact form renders', async ({ page, goto }) => {
  await goto('/contact', { waitUntil: 'hydration' })
  await expect(page.getByRole('button', { name: /send message/i })).toBeVisible()
})

test('404 page renders custom error', async ({ page, goto }) => {
  await goto('/this-page-does-not-exist', { waitUntil: 'hydration' })
  await expect(page.locator('body')).toContainText(/not found|Page not found/i)
})
