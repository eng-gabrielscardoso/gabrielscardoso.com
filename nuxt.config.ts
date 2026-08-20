// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'
import { appIcons } from './shared/icons'
import { siteConfig } from './shared/site.config'
import { gravatarUrl } from './shared/utils'

const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || siteConfig.url

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: true,

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', href: '/favicon.png', sizes: '96x96' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' },
      ],
      meta: [{ name: 'theme-color', content: '#0a0a0a' }],
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
    'nuxt-security',
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

  robots: {
    // Keep the CMS and API endpoints out of search results.
    disallow: ['/_studio', '/api'],
  },

  schemaOrg: {
    identity: {
      type: 'Person',
      name: siteConfig.name,
      url: siteUrl,
      image: gravatarUrl(siteConfig.avatar.gravatarHash, 512),
      sameAs: siteConfig.socials.map((social) => social.href),
    },
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
      cookieSecure: true,
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

  // Dev traffic (HMR, devtools, the @nuxt/icon API) burns through the
  // default rate-limit budget of 150 requests per 5 minutes, after which
  // every request 429s and SSR icon lookups start failing.
  $development: {
    security: {
      rateLimiter: false,
    },
  },

  security: {
    headers: {
      contentSecurityPolicy: {
        // Fallback for every fetch directive not listed below (frame-src,
        // worker-src, media-src, ...); without it those default to allow-all.
        'default-src': ["'self'"],
        // Analytics beacons (Clarity, GTM) post to third-party HTTPS hosts.
        'connect-src': ["'self'", 'https:'],
        'script-src': [
          "'self'",
          'https:',
          "'unsafe-inline'",
          "'strict-dynamic'",
          "'nonce-{{nonce}}'",
          // @nuxt/content v3 runs client-side queries on a WebAssembly
          // SQLite database; without this every page 500s after hydration.
          "'wasm-unsafe-eval'",
        ],
        'img-src': ["'self'", 'data:', 'https://gravatar.com', 'https://www.gravatar.com'],
      },
    },
  },

  routeRules: {
    '/_studio/**': { ssr: true },
    '/api/**': { cors: true },
  },
})
