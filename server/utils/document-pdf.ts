import { PDFDocument, PDFName, PDFString, StandardFonts, rgb } from 'pdf-lib'
import type { PDFFont, PDFPage, PDFRef, RGB } from 'pdf-lib'
import type { DocumentBlock, InlineRun } from '#shared/document-blocks'

/**
 * Typesets a document straight to PDF instead of asking the browser to print the page.
 *
 * Print stylesheets are a suggestion: every engine paginates, hyphenates and scales them
 * differently, and the browser stamps its own header, footer and page numbers on top. Laying the
 * pages out here means the file a recruiter opens is byte-for-byte the same one every time, and
 * that line height, margins and page breaks are decisions rather than side effects.
 *
 * Only the 14 fonts every PDF viewer ships are used, so nothing has to be embedded.
 */

export interface DocumentPdfOptions {
  /** Document owner, used for the PDF `Author` field and the page footer. */
  author: string
  /** Document name, used for the PDF `Title` field and the page footer. */
  title: string
  subject?: string
  keywords?: string[]
  /** BCP 47 tag, so screen readers and search indexers read the file in the right language. */
  language?: string
  /**
   * `cv` is dense résumé typesetting; `letter` is a single-page cover letter with larger type,
   * more breathing room and a header rule — the CV stylesheet makes a letter look like a draft.
   */
  layout?: 'cv' | 'letter'
}

/** A4, in points. */
const PAGE = { width: 595.28, height: 841.89 }

interface LayoutMetrics {
  margin: { top: number; right: number; bottom: number; left: number }
  footerBaseline: number
  textFloor: number
  contentWidth: number
}

const CV_LAYOUT: LayoutMetrics = {
  margin: { top: 42, right: 46, bottom: 34, left: 46 },
  footerBaseline: 22,
  textFloor: 42,
  contentWidth: PAGE.width - 46 - 46,
}

/** Cover letters need room to breathe; CV margins make them look abandoned at the top of the page. */
const LETTER_LAYOUT: LayoutMetrics = {
  margin: { top: 56, right: 58, bottom: 48, left: 58 },
  footerBaseline: 28,
  textFloor: 56,
  contentWidth: PAGE.width - 58 - 58,
}

const INK = rgb(0.09, 0.1, 0.12)
const MUTED = rgb(0.33, 0.36, 0.4)
const FAINT = rgb(0.55, 0.58, 0.62)
const RULE = rgb(0.8, 0.82, 0.84)
/** The site's green, darkened until it still reads as a link on paper and in greyscale. */
const LINK = rgb(0, 0.42, 0.29)
const ACCENT = rgb(0, 0.55, 0.38)

type FontWeight = 'regular' | 'bold' | 'italic' | 'boldItalic' | 'mono'

type Fonts = Record<FontWeight, PDFFont>

interface BlockStyle {
  size: number
  leading: number
  weight: FontWeight
  color: RGB
  /** Space above the block, collapsed against the previous block's `spaceAfter`. */
  spaceBefore: number
  spaceAfter: number
  uppercase?: boolean
  /** Draws a hairline under the block, the way section headings are separated. */
  ruled?: boolean
  indent?: number
}

/**
 * Tuned so a senior CV lands in two pages without turning into fine print: 9.3pt on 12pt is the
 * density of a printed résumé, not of a web page shrunk to fit.
 */
const CV_STYLES: Record<DocumentBlock['type'], BlockStyle> = {
  title: { size: 19, leading: 21, weight: 'bold', color: INK, spaceBefore: 0, spaceAfter: 2.5 },
  lede: { size: 10.5, leading: 12.5, weight: 'bold', color: INK, spaceBefore: 0, spaceAfter: 2.5 },
  section: {
    size: 9,
    leading: 10.5,
    weight: 'bold',
    color: INK,
    spaceBefore: 11,
    spaceAfter: 5.5,
    uppercase: true,
    ruled: true,
  },
  entry: { size: 10, leading: 12, weight: 'bold', color: INK, spaceBefore: 7, spaceAfter: 2 },
  meta: { size: 8.6, leading: 10, weight: 'italic', color: MUTED, spaceBefore: 0, spaceAfter: 2 },
  detail: {
    size: 8.7,
    leading: 10.8,
    weight: 'regular',
    color: MUTED,
    spaceBefore: 2.5,
    spaceAfter: 1,
  },
  paragraph: {
    size: 9.3,
    leading: 11.8,
    weight: 'regular',
    color: INK,
    spaceBefore: 3.5,
    spaceAfter: 1,
  },
  bullet: {
    size: 9.3,
    leading: 11.6,
    weight: 'regular',
    color: INK,
    spaceBefore: 1.8,
    spaceAfter: 0,
    indent: 10,
  },
  rule: { size: 0, leading: 0, weight: 'regular', color: RULE, spaceBefore: 8, spaceAfter: 8 },
}

/** Cover letter: larger type, letter spacing, sections without the CV shouty uppercase. */
const LETTER_STYLES: Record<DocumentBlock['type'], BlockStyle> = {
  title: { size: 24, leading: 28, weight: 'bold', color: INK, spaceBefore: 0, spaceAfter: 6 },
  lede: { size: 11.5, leading: 15, weight: 'bold', color: ACCENT, spaceBefore: 0, spaceAfter: 10 },
  section: {
    size: 10.5,
    leading: 13,
    weight: 'bold',
    color: INK,
    spaceBefore: 18,
    spaceAfter: 10,
    ruled: true,
  },
  entry: { size: 11, leading: 14, weight: 'bold', color: INK, spaceBefore: 10, spaceAfter: 4 },
  meta: { size: 10, leading: 13, weight: 'italic', color: MUTED, spaceBefore: 0, spaceAfter: 4 },
  detail: {
    size: 10.5,
    leading: 15,
    weight: 'regular',
    color: MUTED,
    spaceBefore: 6,
    spaceAfter: 4,
  },
  paragraph: {
    size: 11,
    leading: 17,
    weight: 'regular',
    color: INK,
    spaceBefore: 11,
    spaceAfter: 2,
  },
  bullet: {
    size: 10.8,
    leading: 16,
    weight: 'regular',
    color: INK,
    spaceBefore: 5,
    spaceAfter: 1,
    indent: 14,
  },
  rule: { size: 0, leading: 0, weight: 'regular', color: RULE, spaceBefore: 14, spaceAfter: 14 },
}

/** Header lines (contact details, links) are set smaller and quieter than body prose. */
const CV_HEADER_PARAGRAPH: BlockStyle = {
  size: 8.8,
  leading: 11,
  weight: 'regular',
  color: MUTED,
  spaceBefore: 1.5,
  spaceAfter: 0,
}

const LETTER_HEADER_PARAGRAPH: BlockStyle = {
  size: 9.8,
  leading: 13.5,
  weight: 'regular',
  color: MUTED,
  spaceBefore: 2.5,
  spaceAfter: 1,
}

/**
 * WinAnsi covers Latin-1 plus these code points, which is everything a CV needs — dashes, curly
 * quotes, bullets. Anything else has to be folded down or dropped, since the standard fonts
 * cannot encode it and pdf-lib would throw mid-render.
 */
const WIN_ANSI_EXTRAS = new Set([
  0x20ac, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020, 0x2021, 0x02c6, 0x2030, 0x0160, 0x2039, 0x0152,
  0x017d, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2013, 0x2014, 0x02dc, 0x2122, 0x0161, 0x203a,
  0x0153, 0x017e, 0x0178,
])

const CHARACTER_FALLBACKS: Record<string, string> = {
  '\u2192': '->',
  '\u2190': '<-',
  '\u21d2': '=>',
  '\u2264': '<=',
  '\u2265': '>=',
  '\u2260': '!=',
  '\u2713': '-',
  '\u2714': '-',
  '\u2022': '\u2022',
  '\u200b': '',
  '\u2011': '-',
  '\u2212': '-',
}

export function sanitizeForPdf(text: string): string {
  let output = ''

  for (const character of text.replace(/[\t\r\n]+/g, ' ')) {
    const code = character.codePointAt(0) ?? 0

    if ((code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff)) {
      // Non-breaking and thin spaces measure like a space but break lines badly.
      output += code === 0xa0 ? ' ' : character
      continue
    }

    if (WIN_ANSI_EXTRAS.has(code)) {
      output += character
      continue
    }

    output += CHARACTER_FALLBACKS[character] ?? ''
  }

  return output
}

interface Segment {
  text: string
  font: PDFFont
  size: number
  color: RGB
  width: number
  href?: string
}

interface Line {
  segments: Segment[]
  width: number
}

interface LinkTarget {
  page: PDFPage
  rect: [number, number, number, number]
  uri: string
}

interface RenderState {
  pdf: PDFDocument
  fonts: Fonts
  page: PDFPage
  /** Top of the next line box; text grows downwards from here. */
  y: number
  pages: PDFPage[]
  links: LinkTarget[]
  layout: LayoutMetrics
  styles: Record<DocumentBlock['type'], BlockStyle>
  headerParagraph: BlockStyle
}

function fontFor(run: InlineRun, style: BlockStyle, fonts: Fonts): PDFFont {
  if (run.code) return fonts.mono

  const bold = run.bold || style.weight === 'bold' || style.weight === 'boldItalic'
  const italic = run.italic || style.weight === 'italic' || style.weight === 'boldItalic'

  if (bold && italic) return fonts.boldItalic
  if (bold) return fonts.bold
  if (italic) return fonts.italic

  return fonts.regular
}

function colorFor(run: InlineRun, style: BlockStyle): RGB {
  return run.href ? LINK : style.color
}

/**
 * pdf-lib measures whole strings with the font's kern pairs, but `drawText` emits a plain string
 * and viewers render it unkerned. Measuring one character at a time is therefore the width the
 * page actually gets — without this, every kerned pair steals space from the following word and
 * the text runs together.
 */
export function measureText(text: string, font: PDFFont, size: number): number {
  let width = 0

  for (const character of text) width += font.widthOfTextAtSize(character, size)

  return width
}

/** Splits a word that cannot fit on any line, so long URLs wrap instead of bleeding off the page. */
function breakWord(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const chunks: string[] = []
  let chunk = ''

  for (const character of text) {
    if (chunk && measureText(chunk + character, font, size) > maxWidth) {
      chunks.push(chunk)
      chunk = character
      continue
    }

    chunk += character
  }

  if (chunk) chunks.push(chunk)

  return chunks
}

function wrap(runs: InlineRun[], style: BlockStyle, fonts: Fonts, maxWidth: number): Line[] {
  const lines: Line[] = []
  let segments: Segment[] = []
  let width = 0

  function flush() {
    while (segments.at(-1)?.text === ' ') {
      width -= segments.pop()?.width ?? 0
    }

    if (segments.length) lines.push({ segments, width })

    segments = []
    width = 0
  }

  function push(text: string, run: InlineRun) {
    const font = fontFor(run, style, fonts)
    const segmentWidth = measureText(text, font, style.size)

    segments.push({
      text,
      font,
      size: style.size,
      color: colorFor(run, style),
      width: segmentWidth,
      href: run.href,
    })

    width += segmentWidth
  }

  for (const run of runs) {
    const text = style.uppercase ? sanitizeForPdf(run.text).toUpperCase() : sanitizeForPdf(run.text)
    const font = fontFor(run, style, fonts)

    for (const token of text.split(/(\s+)/)) {
      if (!token) continue

      if (/^\s+$/.test(token)) {
        if (segments.length) push(' ', run)
        continue
      }

      const tokenWidth = measureText(token, font, style.size)

      if (tokenWidth > maxWidth) {
        for (const chunk of breakWord(token, font, style.size, maxWidth)) {
          if (width + measureText(chunk, font, style.size) > maxWidth) flush()
          push(chunk, run)
        }
        continue
      }

      if (width + tokenWidth > maxWidth) flush()
      push(token, run)
    }
  }

  flush()

  return lines
}

function drawLine(state: RenderState, line: Line, x: number, top: number, leading: number) {
  const maxSize = Math.max(...line.segments.map((segment) => segment.size))
  const baseline = top - maxSize * 0.82
  let cursor = x

  for (const segment of line.segments) {
    state.page.drawText(segment.text, {
      x: cursor,
      y: baseline,
      size: segment.size,
      font: segment.font,
      color: segment.color,
    })

    if (segment.href && segment.text.trim()) {
      state.page.drawLine({
        start: { x: cursor, y: baseline - 1.4 },
        end: { x: cursor + segment.width, y: baseline - 1.4 },
        thickness: 0.4,
        color: segment.color,
      })

      state.links.push({
        page: state.page,
        rect: [cursor, baseline - 2, cursor + segment.width, baseline + segment.size * 0.8],
        uri: segment.href,
      })
    }

    cursor += segment.width
  }

  return top - leading
}

function addPage(state: RenderState) {
  state.page = state.pdf.addPage([PAGE.width, PAGE.height])
  state.pages.push(state.page)
  state.y = PAGE.height - state.layout.margin.top
}

/**
 * Starts a new page when the next block would not fit. A block taller than a whole page still has
 * to be drawn, so an already empty page is never broken again.
 */
function ensureSpace(state: RenderState, height: number) {
  const atPageTop = state.y >= PAGE.height - state.layout.margin.top - 0.5

  if (state.y - height < state.layout.textFloor && !atPageTop) addPage(state)
}

function blockHeight(lines: Line[], style: BlockStyle): number {
  return lines.length * style.leading + (style.ruled ? 3 : 0)
}

function renderBlock(
  state: RenderState,
  block: DocumentBlock,
  style: BlockStyle,
  options: { rightAligned?: InlineRun[]; keepWithNext?: number } = {},
) {
  if (block.type === 'rule') {
    ensureSpace(state, style.spaceBefore + style.spaceAfter)
    state.y -= style.spaceBefore
    state.page.drawLine({
      start: { x: state.layout.margin.left, y: state.y },
      end: { x: state.layout.margin.left + state.layout.contentWidth, y: state.y },
      thickness: 0.5,
      color: RULE,
    })
    state.y -= style.spaceAfter

    return
  }

  const indent = style.indent ?? 0
  const marker = block.type === 'bullet' ? (block.marker ?? '\u2022') : ''
  const depthIndent = (block.depth ?? 0) * 12
  const textLeft = state.layout.margin.left + depthIndent + indent

  // The date range sits on the entry's first line, which saves a line per role over a whole CV.
  const trailing = options.rightAligned?.length
    ? wrap(options.rightAligned, state.styles.meta, state.fonts, state.layout.contentWidth / 2)
    : []
  const trailingLine = trailing.length === 1 ? trailing[0] : undefined
  const trailingWidth = trailingLine ? trailingLine.width + 14 : 0

  const lines = wrap(
    block.runs,
    style,
    state.fonts,
    state.layout.contentWidth - depthIndent - indent - trailingWidth,
  )
  if (!lines.length) return

  state.y -= style.spaceBefore
  ensureSpace(state, blockHeight(lines, style) + (options.keepWithNext ?? 0))

  let top = state.y

  lines.forEach((line, index) => {
    if (index === 0 && marker) {
      state.page.drawText(marker, {
        x: state.layout.margin.left + depthIndent,
        y: top - style.size * 0.82,
        size: style.size,
        font: state.fonts.regular,
        color: MUTED,
      })
    }

    if (index === 0 && trailingLine) {
      drawLine(
        state,
        trailingLine,
        state.layout.margin.left + state.layout.contentWidth - trailingLine.width,
        top,
        state.styles.meta.leading,
      )
    }

    top = drawLine(state, line, textLeft, top, style.leading)
  })

  state.y = top

  if (style.ruled) {
    state.y -= 2
    state.page.drawLine({
      start: { x: state.layout.margin.left, y: state.y },
      end: { x: state.layout.margin.left + state.layout.contentWidth, y: state.y },
      thickness: 0.7,
      color: RULE,
    })
  }

  state.y -= style.spaceAfter
}

function drawFooters(state: RenderState, label: string, showPageNumbers: boolean) {
  const total = state.pages.length

  state.pages.forEach((page, index) => {
    const left = sanitizeForPdf(label)
    const right = showPageNumbers ? `${index + 1} / ${total}` : ''

    page.drawLine({
      start: { x: state.layout.margin.left, y: state.layout.footerBaseline + 12 },
      end: {
        x: state.layout.margin.left + state.layout.contentWidth,
        y: state.layout.footerBaseline + 12,
      },
      thickness: 0.4,
      color: RULE,
    })

    page.drawText(left, {
      x: state.layout.margin.left,
      y: state.layout.footerBaseline,
      size: 7.5,
      font: state.fonts.regular,
      color: FAINT,
    })

    if (right) {
      page.drawText(right, {
        x:
          state.layout.margin.left +
          state.layout.contentWidth -
          measureText(right, state.fonts.regular, 7.5),
        y: state.layout.footerBaseline,
        size: 7.5,
        font: state.fonts.regular,
        color: FAINT,
      })
    }
  })
}

/** Green hairline that separates letterhead from the body — the visual cue a CV section rule is not. */
function drawLetterAccent(state: RenderState) {
  state.y -= 14
  state.page.drawLine({
    start: { x: state.layout.margin.left, y: state.y },
    end: { x: state.layout.margin.left + state.layout.contentWidth, y: state.y },
    thickness: 1.6,
    color: ACCENT,
  })
  state.y -= 16
}

function blockText(block: DocumentBlock): string {
  return block.runs.map((run) => run.text).join('')
}

/** Contact / link lines are short; salutations and body paragraphs are not treated as letterhead. */
function isLetterheadParagraph(block: DocumentBlock): boolean {
  if (block.type !== 'paragraph') return false

  const text = blockText(block).trim()
  if (!text || text.length > 110) return false
  // "Dear hiring manager," / "Prezado(a) recrutador(a)," open the body, not the letterhead.
  if (/,$/.test(text)) return false

  return true
}

function attachLinks(state: RenderState) {
  const byPage = new Map<PDFPage, PDFRef[]>()

  for (const link of state.links) {
    const annotation = state.pdf.context.register(
      state.pdf.context.obj({
        Type: 'Annot',
        Subtype: 'Link',
        Rect: link.rect,
        Border: [0, 0, 0],
        // Print the annotation, and let viewers keep it clickable.
        F: 4,
        A: { Type: 'Action', S: 'URI', URI: PDFString.of(link.uri) },
      }),
    )

    byPage.set(link.page, [...(byPage.get(link.page) ?? []), annotation])
  }

  for (const [page, annotations] of byPage) {
    page.node.set(PDFName.of('Annots'), state.pdf.context.obj(annotations))
  }
}

interface TypesetResult {
  bytes: Uint8Array
  pageCount: number
  /** How much of the last page's column is used, 0 to 1. */
  lastPageFill: number
}

/**
 * Leading and block spacing scale together, so a document can be tightened without touching font
 * sizes. Below this the lines start to collide with each other.
 */
function scaleStyle(style: BlockStyle, density: number): BlockStyle {
  return {
    ...style,
    leading: Math.max(style.size * 1.12, style.leading * density),
    spaceBefore: style.spaceBefore * density,
    spaceAfter: style.spaceAfter * density,
  }
}

async function typeset(
  blocks: DocumentBlock[],
  options: DocumentPdfOptions,
  density: number,
): Promise<TypesetResult> {
  const isLetter = options.layout === 'letter'
  const pdf = await PDFDocument.create()

  const state: RenderState = {
    pdf,
    fonts: {
      regular: await pdf.embedFont(StandardFonts.Helvetica),
      bold: await pdf.embedFont(StandardFonts.HelveticaBold),
      italic: await pdf.embedFont(StandardFonts.HelveticaOblique),
      boldItalic: await pdf.embedFont(StandardFonts.HelveticaBoldOblique),
      mono: await pdf.embedFont(StandardFonts.Courier),
    },
    page: undefined as unknown as PDFPage,
    y: 0,
    pages: [],
    links: [],
    layout: isLetter ? LETTER_LAYOUT : CV_LAYOUT,
    styles: isLetter ? LETTER_STYLES : CV_STYLES,
    headerParagraph: isLetter ? LETTER_HEADER_PARAGRAPH : CV_HEADER_PARAGRAPH,
  }

  addPage(state)

  let inHeader = true

  for (const [index, block] of blocks.entries()) {
    const next = blocks[index + 1]

    // A date range following an entry heading is drawn on that heading's line, not below it.
    if (block.type === 'meta' && blocks[index - 1]?.type === 'entry') continue

    if (inHeader) {
      const leaveHeader = isLetter
        ? block.type === 'section' ||
          block.type === 'bullet' ||
          (block.type === 'paragraph' && !isLetterheadParagraph(block))
        : block.type === 'section'

      if (leaveHeader) {
        if (isLetter) drawLetterAccent(state)
        inHeader = false
      }
    }

    const base =
      inHeader && block.type === 'paragraph' ? state.headerParagraph : state.styles[block.type]
    const style = scaleStyle(index === 0 ? { ...base, spaceBefore: 0 } : base, density)

    // Salutation and sign-off get a little extra air in a letter.
    if (isLetter && block.type === 'paragraph' && !inHeader) {
      const text = blockText(block).trim()
      if (/,$/.test(text) && text.length < 60) style.spaceBefore = Math.max(style.spaceBefore, 4)
      if (/^(best regards|atenciosamente|sincerely|kind regards)\b/i.test(text)) {
        style.spaceBefore = Math.max(style.spaceBefore, 16)
      }
    }

    renderBlock(state, block, style, {
      rightAligned: block.type === 'entry' && next?.type === 'meta' ? next.runs : undefined,
      // Never let a heading be the last thing on a page.
      keepWithNext: block.type === 'section' ? 34 : block.type === 'entry' ? 26 : 0,
    })
  }

  attachLinks(state)
  drawFooters(
    state,
    `${options.author} \u2014 ${options.title}`,
    !isLetter || state.pages.length > 1,
  )

  pdf.setTitle(`${options.title} \u2014 ${options.author}`)
  pdf.setAuthor(options.author)
  pdf.setCreator(options.author)
  pdf.setProducer('gabrielscardoso.com')
  pdf.setCreationDate(new Date())
  pdf.setModificationDate(new Date())

  if (options.subject) pdf.setSubject(options.subject)
  if (options.keywords?.length) pdf.setKeywords(options.keywords)
  if (options.language) pdf.setLanguage(options.language)

  const columnHeight = PAGE.height - state.layout.margin.top - state.layout.textFloor

  return {
    bytes: await pdf.save(),
    pageCount: state.pages.length,
    lastPageFill: (PAGE.height - state.layout.margin.top - state.y) / columnHeight,
  }
}

/**
 * A last page holding two or three lines is the formatting failing, not the content being too long,
 * so the document is typeset again slightly tighter until it stops spilling. Nothing is compressed
 * unless it actually saves a page, and font sizes never change — only the space between lines.
 */
const DENSITY_STEPS = [1, 0.97, 0.94, 0.9]
/** Below this, a trailing page is treated as a spill rather than a page of its own. */
const SPARSE_LAST_PAGE = 0.22

export async function renderDocumentPdf(
  blocks: DocumentBlock[],
  options: DocumentPdfOptions,
): Promise<Uint8Array> {
  // Letters are meant to breathe; squeezing them undoes the layout.
  if (options.layout === 'letter') {
    return (await typeset(blocks, options, 1)).bytes
  }

  const [density, ...tighter] = DENSITY_STEPS
  const natural = await typeset(blocks, options, density ?? 1)

  if (natural.pageCount === 1 || natural.lastPageFill >= SPARSE_LAST_PAGE) return natural.bytes

  for (const step of tighter) {
    const tightened = await typeset(blocks, options, step)

    if (tightened.pageCount < natural.pageCount) return tightened.bytes
  }

  return natural.bytes
}
