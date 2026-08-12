import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { siteConfig } from '#shared/site.config'
import HeroSection from '~/components/HeroSection.vue'

describe('HeroSection', () => {
  it('renders hero content in english', async () => {
    const wrapper = await mountSuspended(HeroSection, {
      props: {
        headline: 'Software Engineer building elegant web experiences.',
        location: 'Brazil',
      },
      route: '/',
    })

    expect(wrapper.text()).toContain('Hello')
    expect(wrapper.text()).toContain(siteConfig.nickname)
    expect(wrapper.text()).toContain('Brazil')
  })

  it('renders the configured avatar', async () => {
    const wrapper = await mountSuspended(HeroSection, {
      props: { location: 'Brazil' },
      route: '/',
    })

    expect(wrapper.find('img').attributes('src')).toContain(siteConfig.avatar.gravatarHash)
  })
})
