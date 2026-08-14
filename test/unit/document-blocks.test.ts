import { describe, expect, it } from 'vitest'
import { toDocumentBlocks } from '#shared/document-blocks'
import type { MinimarkTree } from '#shared/document-blocks'

/** Mirrors the tree @nuxt/content stores for `content/{locale}/cv/index.md`. */
const tree: MinimarkTree = {
  value: [
    ['h1', { id: 'name' }, 'Gabriel Santos Cardoso'],
    ['p', {}, ['strong', {}, 'Software Engineer']],
    ['p', {}, 'Barcarena · ', ['a', { href: 'mailto:me@example.com' }, 'me@example.com']],
    ['h2', { id: 'experience' }, 'Experience'],
    ['h3', { id: 'role' }, 'Blockchain Developer — GoLedger'],
    ['p', {}, ['em', {}, 'Aug 2025 – Present']],
    [
      'ul',
      {},
      ['li', {}, 'Built ', ['strong', {}, 'networks'], ' on Fabric.'],
      ['li', {}, 'Shipped ZKP pilots.'],
    ],
    ['p', {}, ['strong', {}, 'Stack:'], ' Go, Node.js'],
    ['p', {}, 'Plain prose about the role.'],
  ],
}

describe('toDocumentBlocks', () => {
  const blocks = toDocumentBlocks(tree)

  it('maps headings to their document role', () => {
    expect(blocks[0]).toMatchObject({ type: 'title' })
    expect(blocks.find((block) => block.runs[0]?.text === 'Experience')).toMatchObject({
      type: 'section',
    })
    expect(blocks.find((block) => block.runs[0]?.text.includes('GoLedger'))).toMatchObject({
      type: 'entry',
    })
  })

  it('separates a fully bold headline from a fully italic date range', () => {
    expect(blocks[1]).toMatchObject({ type: 'lede' })
    expect(blocks.find((block) => block.type === 'meta')?.runs[0]?.text).toBe('Aug 2025 – Present')
  })

  it('recognises a paragraph led by a bold label as supporting detail', () => {
    const detail = blocks.find((block) => block.type === 'detail')

    expect(detail?.runs[0]).toMatchObject({ text: 'Stack:', bold: true })
    expect(detail?.runs[1]?.text).toBe(' Go, Node.js')
  })

  it('keeps prose paragraphs as prose', () => {
    expect(blocks.at(-1)).toMatchObject({ type: 'paragraph' })
  })

  it('flattens list items and keeps their inline emphasis', () => {
    const bullets = blocks.filter((block) => block.type === 'bullet')

    expect(bullets).toHaveLength(2)
    expect(bullets[0]?.runs).toEqual([
      { text: 'Built ' },
      { text: 'networks', bold: true },
      { text: ' on Fabric.' },
    ])
  })

  it('carries link targets through to the runs', () => {
    const contact = blocks[2]

    expect(contact?.runs.at(-1)).toMatchObject({
      text: 'me@example.com',
      href: 'mailto:me@example.com',
    })
  })

  it('numbers ordered list items and indents nested lists', () => {
    const nested = toDocumentBlocks({
      value: [
        ['ol', {}, ['li', {}, 'First', ['ul', {}, ['li', {}, 'Nested']]], ['li', {}, 'Second']],
      ],
    })

    expect(nested.map((block) => [block.marker, block.depth, block.runs[0]?.text])).toEqual([
      ['1.', 0, 'First'],
      [undefined, 1, 'Nested'],
      ['2.', 0, 'Second'],
    ])
  })

  it('drops empty nodes and tolerates a missing body', () => {
    expect(
      toDocumentBlocks({
        value: [
          ['p', {}, ''],
          ['p', {}, '   '],
        ],
      }),
    ).toEqual([])
    expect(toDocumentBlocks(null)).toEqual([])
  })
})
