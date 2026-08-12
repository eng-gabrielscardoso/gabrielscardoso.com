import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ProjectCard from '~/components/ProjectCard.vue'

describe('ProjectCard', () => {
  it('renders project details', async () => {
    const wrapper = await mountSuspended(ProjectCard, {
      props: {
        title: 'Test Project',
        association: 'Test Org',
        startDate: '2024-01',
        link: 'https://example.com',
      },
      route: '/',
    })

    expect(wrapper.text()).toContain('Test Project')
    expect(wrapper.text()).toContain('Test Org')
  })
})
