import { fileURLToPath } from 'node:url'
import { defineConfig, devices } from '@playwright/test'
import type { ConfigOptions } from '@nuxt/test-utils/playwright'

export default defineConfig<ConfigOptions>({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 120_000,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    nuxt: {
      rootDir: fileURLToPath(new URL('.', import.meta.url)),
      // In CI we build once and start a single preview server (see ci.yml),
      // then point tests at it instead of letting @nuxt/test-utils rebuild
      // and boot a fresh Nuxt instance per test. Its internal "_nuxtHooks"
      // fixture has a hardcoded 60s setup timeout that a cold build/start
      // routinely exceeds on CI runners, failing every test with
      // `Fixture "_nuxtHooks" timeout of 60000ms exceeded during setup.`
      ...(process.env.NUXT_E2E_HOST ? { host: process.env.NUXT_E2E_HOST } : {}),
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
