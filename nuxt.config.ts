// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'
import { appIcons } from './shared/icons'
import { siteConfig } from './shared/site.config'

const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || siteConfig.url

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: true,

  app: {
    head: {
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },

  modules: [
    '@nuxt/a11y',
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/ui',
    '@nuxt/test-utils',
    '@nuxtjs/i18n',
    '@nuxtjs/seo',
    '@nuxt/image',
    '@nuxt/scripts',
    'motion-v/nuxt',
    'nuxt-studio',
  ],

  css: ['~/assets/css/main.css'],

  content: {
    experimental: {
      // better-sqlite3 fails to load its native binding on Vercel's
      // serverless runtime ("Module did not self-register"), so use the
      // Node.js built-in node:sqlite (requires Node >= 22.5).
      sqliteConnector: 'native',
    },
  },

  icon: {
    serverBundle: {
      collections: ['lucide', 'logos'],
    },
    clientBundle: {
      scan: true,
      includeCustomCollections: true,
      icons: [...appIcons],
      sizeLimitKb: 512,
    },
  },

  alias: {
    '#shared': fileURLToPath(new URL('./shared', import.meta.url)),
  },

  site: {
    url: siteUrl,
    name: siteConfig.name,
    description: siteConfig.description,
    defaultLocale: 'en',
  },

  i18n: {
    baseUrl: siteUrl,
    locales: [
      { code: 'en', language: 'en-GB', name: 'English (UK)', file: 'en.json' },
      { code: 'pt', language: 'pt-BR', name: 'Português (Brasil)', file: 'pt.json' },
    ],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    langDir: 'locales',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
  },

  colorMode: {
    preference: 'dark',
    fallback: 'dark',
  },

  runtimeConfig: {
    resendApiKey: '',
    contactEmail: '',
    contactFromEmail: '',
    contactRateLimitSeconds: 3600,
    studioGithubClientId: '',
    studioGithubClientSecret: '',
    public: {
      siteUrl,
      gtmId: '',
      clarityId: '',
    },
  },

  studio: {
    route: '/_studio',
    repository: {
      provider: 'github',
      owner: siteConfig.repository.owner,
      repo: siteConfig.repository.name,
      branch: siteConfig.repository.branch,
    },
    auth: {
      github: {
        clientId: process.env.STUDIO_GITHUB_CLIENT_ID,
        clientSecret: process.env.STUDIO_GITHUB_CLIENT_SECRET,
      },
    },
  },

  nitro: {
    storage: {
      rateLimit: {
        driver: 'memory',
      },
    },
  },

  routeRules: {
    '/_studio/**': { ssr: true },
    '/api/**': { cors: true },
  },
})
