import { afterEach, describe, expect, it, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent, h } from 'vue'
import { UApp } from '#components'
import DocumentActions from '~/components/DocumentActions.vue'

const props = {
  markdown: '# Gabriel Santos Cardoso\n\nSoftware Engineer.',
  pdfPath: '/cv.pdf',
  filename: 'gabriel-santos-cardoso-cv',
  documentTitle: 'Curriculum vitae — Gabriel Santos Cardoso',
}

/** `UApp` provides the toast context the actions rely on, exactly as `app.vue` does. */
const Harness = defineComponent({
  setup() {
    return () => h(UApp, null, { default: () => h(DocumentActions, props) })
  },
})

function mountActions() {
  return mountSuspended(Harness, { route: '/cv' })
}

function stubShareTarget(share: typeof navigator.share | undefined) {
  Object.defineProperty(navigator, 'share', { value: share, configurable: true, writable: true })
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('DocumentActions', () => {
  it('renders the three document actions', async () => {
    const wrapper = await mountActions()

    expect(wrapper.find('a[download]').text()).toContain('PDF')
    expect(wrapper.findAll('button')[0]?.text()).toContain('Markdown')
    expect(wrapper.findAll('button')[1]?.text()).toContain('Share')
  })

  it('downloads the pdf the server typeset, rather than printing the page', async () => {
    const wrapper = await mountActions()
    const link = wrapper.find('a[download]')

    expect(link.attributes('href')).toBe('/cv.pdf')
    expect(link.attributes('download')).toBe('gabriel-santos-cardoso-cv.pdf')
  })

  it('downloads the markdown source under the document filename', async () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const wrapper = await mountActions()

    await wrapper.findAll('button')[0]?.trigger('click')

    const link = click.mock.instances[0] as HTMLAnchorElement
    expect(link.download).toBe('gabriel-santos-cardoso-cv.md')
    expect(link.href).toMatch(/^blob:/)
  })

  it('copies the canonical url when the native share sheet is unavailable', async () => {
    stubShareTarget(undefined)
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })

    const wrapper = await mountActions()
    await wrapper.findAll('button')[1]?.trigger('click')

    expect(writeText).toHaveBeenCalledWith(expect.stringMatching(/\/cv$/))
  })

  it('prefers the native share sheet when the browser has one', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    stubShareTarget(share)

    const wrapper = await mountActions()
    await wrapper.findAll('button')[1]?.trigger('click')

    expect(share).toHaveBeenCalledWith({
      title: props.documentTitle,
      url: expect.stringMatching(/\/cv$/),
    })
  })
})
