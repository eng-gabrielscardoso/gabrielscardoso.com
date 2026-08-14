import { describe, expect, it } from 'vitest'
import { PDFDocument, PDFName, StandardFonts } from 'pdf-lib'
import type { DocumentBlock } from '#shared/document-blocks'
import { measureText, renderDocumentPdf, sanitizeForPdf } from '../../server/utils/document-pdf'

const options = { author: 'Gabriel Santos Cardoso', title: 'Curriculum vitae', language: 'en-GB' }

function bullets(count: number): DocumentBlock[] {
  return Array.from({ length: count }, (_, index) => ({
    type: 'bullet' as const,
    runs: [{ text: `Shipped feature number ${index + 1}.` }],
  }))
}

async function render(blocks: DocumentBlock[]) {
  const bytes = await renderDocumentPdf(blocks, options)

  return { bytes, pdf: await PDFDocument.load(bytes) }
}

describe('renderDocumentPdf', () => {
  it('writes a PDF carrying the document metadata', async () => {
    const { bytes, pdf } = await render([
      { type: 'title', runs: [{ text: 'Gabriel Santos Cardoso' }] },
      { type: 'section', runs: [{ text: 'Summary' }] },
      { type: 'paragraph', runs: [{ text: 'Software Engineer.' }] },
    ])

    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe('%PDF-')
    expect(pdf.getPageCount()).toBe(1)
    expect(pdf.getTitle()).toBe('Curriculum vitae — Gabriel Santos Cardoso')
    expect(pdf.getAuthor()).toBe('Gabriel Santos Cardoso')
  })

  it('keeps links clickable', async () => {
    const { pdf } = await render([
      {
        type: 'paragraph',
        runs: [{ text: 'Portfolio', href: 'https://www.gabrielscardoso.com' }],
      },
    ])

    const annotations = pdf.getPage(0).node.get(PDFName.of('Annots'))

    expect(annotations).toBeDefined()
  })

  it('tightens a document that spills a couple of lines onto a second page', async () => {
    const { pdf } = await render(bullets(58))

    expect(pdf.getPageCount()).toBe(1)
  })

  it('leaves a genuinely longer document paginated', async () => {
    const { pdf } = await render(bullets(120))

    expect(pdf.getPageCount()).toBeGreaterThan(1)
  })

  it('wraps a URL too long for the column instead of overflowing the page', async () => {
    const { pdf } = await render([
      { type: 'paragraph', runs: [{ text: `https://example.com/${'segment-'.repeat(60)}end` }] },
    ])

    expect(pdf.getPageCount()).toBe(1)
  })

  it('typesets a letter layout without treating the body as letterhead', async () => {
    const bytes = await renderDocumentPdf(
      [
        { type: 'title', runs: [{ text: 'Gabriel Santos Cardoso' }] },
        { type: 'lede', runs: [{ text: 'Software Engineer', bold: true }] },
        { type: 'paragraph', runs: [{ text: 'Barcarena · me@example.com' }] },
        { type: 'paragraph', runs: [{ text: 'Dear hiring manager,' }] },
        {
          type: 'paragraph',
          runs: [
            {
              text: 'I am writing to introduce myself as a Software Engineer with more than five years building production systems.',
            },
          ],
        },
        { type: 'section', runs: [{ text: 'What I bring' }] },
        { type: 'bullet', runs: [{ text: 'Strong backend and API design.' }] },
        { type: 'paragraph', runs: [{ text: 'Best regards,' }] },
      ],
      { ...options, title: 'Cover letter', layout: 'letter' },
    )
    const pdf = await PDFDocument.load(bytes)

    expect(pdf.getPageCount()).toBe(1)
    expect(pdf.getTitle()).toBe('Cover letter — Gabriel Santos Cardoso')
  })
})

describe('measureText', () => {
  it('ignores kern pairs, because drawn text is not kerned', async () => {
    const pdf = await PDFDocument.create()
    const font = await pdf.embedFont(StandardFonts.Helvetica)

    // "P," is a kern pair in Helvetica: pdf-lib measures it tighter than it draws it.
    expect(measureText('PHP,', font, 10)).toBeGreaterThan(font.widthOfTextAtSize('PHP,', 10))
    expect(measureText('PHP,', font, 10)).toBeCloseTo(
      ['P', 'H', 'P', ','].reduce((total, char) => total + font.widthOfTextAtSize(char, 10), 0),
      5,
    )
  })
})

describe('sanitizeForPdf', () => {
  it('keeps the punctuation and accents a CV is written with', () => {
    expect(sanitizeForPdf('Pará — Jan 2023 – Present · “quoted”')).toBe(
      'Pará — Jan 2023 – Present · “quoted”',
    )
  })

  it('folds down or drops glyphs the standard fonts cannot encode', () => {
    expect(sanitizeForPdf('a → b')).toBe('a -> b')
    expect(sanitizeForPdf('done ✓')).toBe('done -')
    expect(sanitizeForPdf('emoji 🚀 gone')).toBe('emoji  gone')
  })

  it('flattens whitespace that would break a line badly', () => {
    expect(sanitizeForPdf('one\ttwo\nthree\u00a0four')).toBe('one two three four')
  })
})
