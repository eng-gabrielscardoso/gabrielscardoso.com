/**
 * Flattens the Markdown tree @nuxt/content stores for a document into the handful of block kinds a
 * CV is actually made of, so the PDF renderer never has to walk a tree or know about Markdown.
 *
 * Keeping this separate from the renderer means the PDF and the web page always describe the same
 * document: whatever is written in `content/{locale}/cv/index.md` is what gets typeset.
 */

/** Structural subset of minimark, the tree format @nuxt/content v3 stores in `body.value`. */
export type MinimarkNode = string | [string, Record<string, unknown>, ...MinimarkNode[]]

export interface MinimarkTree {
  value: MinimarkNode[]
}

export interface InlineRun {
  text: string
  bold?: boolean
  italic?: boolean
  code?: boolean
  href?: string
}

export type DocumentBlockType =
  /** `# Name` — the document owner, printed once at the top. */
  | 'title'
  /** A fully bold paragraph in the header, i.e. the headline under the name. */
  | 'lede'
  /** `## Experience` — top level section, printed with a rule under it. */
  | 'section'
  /** `### Role — Company` — one entry inside a section. */
  | 'entry'
  /** A fully italic paragraph, i.e. the date range under an entry heading. */
  | 'meta'
  /** A paragraph led by a bold `Label:`, i.e. `**Stack:** Go, Vue`. */
  | 'detail'
  | 'paragraph'
  | 'bullet'
  | 'rule'

export interface DocumentBlock {
  type: DocumentBlockType
  runs: InlineRun[]
  /** Nesting depth for list items, so sub-lists keep their indentation. */
  depth?: number
  /** Marker for ordered list items; bullets get one from the renderer. */
  marker?: string
}

const HEADING_BLOCKS: Record<string, DocumentBlockType> = {
  h1: 'title',
  h2: 'section',
  h3: 'entry',
  h4: 'entry',
  h5: 'entry',
  h6: 'entry',
}

function isElement(
  node: MinimarkNode,
): node is [string, Record<string, unknown>, ...MinimarkNode[]] {
  return Array.isArray(node)
}

function childrenOf(node: MinimarkNode): MinimarkNode[] {
  // Slicing a tuple type widens to include the props object, which only ever sits at index 1.
  return isElement(node) ? (node.slice(2) as MinimarkNode[]) : []
}

function tagOf(node: MinimarkNode): string {
  return isElement(node) ? node[0] : '#text'
}

/** Collapses a subtree into styled runs, inheriting emphasis from every ancestor. */
function collectRuns(nodes: MinimarkNode[], inherited: Omit<InlineRun, 'text'> = {}): InlineRun[] {
  const runs: InlineRun[] = []

  for (const node of nodes) {
    if (!isElement(node)) {
      if (node) runs.push({ ...inherited, text: node })
      continue
    }

    const [tag, props] = node

    switch (tag) {
      case 'strong':
        runs.push(...collectRuns(childrenOf(node), { ...inherited, bold: true }))
        break
      case 'em':
        runs.push(...collectRuns(childrenOf(node), { ...inherited, italic: true }))
        break
      case 'code':
        runs.push(...collectRuns(childrenOf(node), { ...inherited, code: true }))
        break
      case 'a':
        runs.push(
          ...collectRuns(childrenOf(node), {
            ...inherited,
            href: typeof props.href === 'string' ? props.href : undefined,
          }),
        )
        break
      case 'br':
        runs.push({ ...inherited, text: ' ' })
        break
      // Images and components carry no text, and their alt text would read as noise on paper.
      case 'img':
      case 'style':
      case 'script':
        break
      default:
        runs.push(...collectRuns(childrenOf(node), inherited))
    }
  }

  return runs
}

/** Drops runs that became empty after collapsing, and merges neighbours sharing a style. */
function normaliseRuns(runs: InlineRun[]): InlineRun[] {
  const merged: InlineRun[] = []

  for (const run of runs) {
    if (!run.text) continue

    const previous = merged.at(-1)
    const sameStyle =
      previous &&
      previous.bold === run.bold &&
      previous.italic === run.italic &&
      previous.code === run.code &&
      previous.href === run.href

    if (sameStyle) previous.text += run.text
    else merged.push({ ...run })
  }

  const first = merged.at(0)
  const last = merged.at(-1)

  if (first) first.text = first.text.replace(/^\s+/, '')
  if (last) last.text = last.text.replace(/\s+$/, '')

  return merged.filter((run) => run.text.length > 0)
}

function classifyParagraph(runs: InlineRun[]): DocumentBlockType {
  if (runs.every((run) => run.italic)) return 'meta'
  if (runs.every((run) => run.bold)) return 'lede'

  // `**Stack:** Go, Vue` reads as supporting metadata rather than prose, so it is set apart.
  const [first] = runs
  if (runs.length > 1 && first?.bold && first.text.trimEnd().endsWith(':')) return 'detail'

  return 'paragraph'
}

function listBlocks(node: MinimarkNode, depth: number): DocumentBlock[] {
  const ordered = tagOf(node) === 'ol'
  const blocks: DocumentBlock[] = []
  let index = 0

  for (const item of childrenOf(node)) {
    if (tagOf(item) !== 'li') continue
    index += 1

    const inline = childrenOf(item).filter((child) => !['ul', 'ol'].includes(tagOf(child)))
    const runs = normaliseRuns(collectRuns(inline))

    if (runs.length) {
      blocks.push({
        type: 'bullet',
        runs,
        depth,
        marker: ordered ? `${index}.` : undefined,
      })
    }

    for (const child of childrenOf(item)) {
      if (['ul', 'ol'].includes(tagOf(child))) blocks.push(...listBlocks(child, depth + 1))
    }
  }

  return blocks
}

export function toDocumentBlocks(body: MinimarkTree | null | undefined): DocumentBlock[] {
  const blocks: DocumentBlock[] = []

  for (const node of body?.value ?? []) {
    const tag = tagOf(node)

    if (tag === 'hr') {
      blocks.push({ type: 'rule', runs: [] })
      continue
    }

    if (tag === 'ul' || tag === 'ol') {
      blocks.push(...listBlocks(node, 0))
      continue
    }

    const runs = normaliseRuns(collectRuns(isElement(node) ? childrenOf(node) : [node]))
    if (!runs.length) continue

    const heading = HEADING_BLOCKS[tag]
    if (heading) {
      blocks.push({ type: heading, runs })
      continue
    }

    // Quotes and code blocks are rare in a CV; typesetting them as prose beats dropping them.
    blocks.push({ type: classifyParagraph(runs), runs })
  }

  return blocks
}
