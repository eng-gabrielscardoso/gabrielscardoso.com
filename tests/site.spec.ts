import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@nuxt/test-utils/playwright'
import { PDFDocument } from 'pdf-lib'

const pages = ['/', '/about', '/projects', '/blog', '/contact', '/cv', '/cover-letter']

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

test('cv page renders the document and downloads its markdown source', async ({ page, goto }) => {
  await goto('/cv', { waitUntil: 'hydration' })

  await expect(
    page.getByRole('heading', { level: 2, name: 'Experience', exact: true }),
  ).toBeVisible()

  const markdown = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Markdown', exact: true }).click()
  expect((await markdown).suggestedFilename()).toBe('gabriel-santos-cardoso-cv.md')

  // The PDF is a real file on the server, not a print dialog. Clicking it would navigate to the
  // document; the page-count assertion below is what proves the file itself is right.
  await expect(page.getByRole('link', { name: 'PDF', exact: true })).toHaveAttribute(
    'href',
    '/cv.pdf',
  )
})

test('cover letter page renders and links to its server-typeset pdf', async ({ page, goto }) => {
  await goto('/cover-letter', { waitUntil: 'hydration' })

  await expect(page.getByText(/dear hiring manager/i)).toBeVisible()

  const markdown = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Markdown', exact: true }).click()
  expect((await markdown).suggestedFilename()).toBe('gabriel-santos-cardoso-cover-letter.md')

  await expect(page.getByRole('link', { name: 'PDF', exact: true })).toHaveAttribute(
    'href',
    '/cover-letter.pdf',
  )
})

for (const path of ['/cv.pdf', '/pt/cv.pdf']) {
  test(`${path} is served as a typeset pdf of at most two pages`, async ({ request }) => {
    const response = await request.get(path)

    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toBe('application/pdf')

    const pdf = await PDFDocument.load(await response.body())

    // The whole point of typesetting this ourselves: a CV that does not sprawl over five pages.
    expect(pdf.getPageCount()).toBeLessThanOrEqual(2)
    expect(pdf.getAuthor()).toBe('Gabriel Santos Cardoso')
  })
}

for (const path of ['/cover-letter.pdf', '/pt/cover-letter.pdf']) {
  test(`${path} is served as a one-page typeset pdf`, async ({ request }) => {
    const response = await request.get(path)

    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toBe('application/pdf')

    const pdf = await PDFDocument.load(await response.body())

    expect(pdf.getPageCount()).toBe(1)
    expect(pdf.getAuthor()).toBe('Gabriel Santos Cardoso')
  })
}

test('404 page renders custom error', async ({ page, goto }) => {
  await goto('/this-page-does-not-exist', { waitUntil: 'hydration' })
  await expect(page.locator('body')).toContainText(/not found|Page not found/i)
})
