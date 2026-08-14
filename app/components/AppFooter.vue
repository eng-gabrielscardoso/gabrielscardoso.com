<script setup lang="ts">
import { siteConfig } from '#shared/site.config'

const { t } = useI18n()
const localePath = useLocalePath()

const footerLinks = computed(() => [
  { label: t('nav.about'), to: localePath('/about') },
  { label: t('nav.projects'), to: localePath('/projects') },
  { label: t('nav.blog'), to: localePath('/blog') },
  { label: t('nav.contact'), to: localePath('/contact') },
])

const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-neutral-800/80 bg-neutral-950 print:hidden">
    <UContainer class="py-12">
      <div class="grid gap-8 md:grid-cols-3">
        <div>
          <p class="font-semibold text-neutral-100">{{ siteConfig.name }}</p>
          <p class="mt-2 text-sm text-neutral-400">{{ t(siteConfig.roleKey) }}</p>
        </div>

        <nav aria-label="Footer navigation">
          <ul class="space-y-2">
            <li v-for="link in footerLinks" :key="link.to">
              <NuxtLink
                :to="link.to"
                class="text-sm text-neutral-400 transition-colors hover:text-green-400"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <div class="flex gap-3">
          <UButton
            v-for="social in siteConfig.socials"
            :key="social.id"
            :icon="social.icon"
            color="neutral"
            variant="ghost"
            :to="social.href"
            target="_blank"
          >
            <span class="sr-only">{{ social.label }}</span>
          </UButton>
        </div>
      </div>

      <div
        class="mt-8 flex flex-col items-center justify-between gap-2 border-t border-neutral-800 pt-8 text-sm text-neutral-500 sm:flex-row"
      >
        <p>&copy; {{ currentYear }} {{ siteConfig.name }}. {{ t('footer.copyright') }}</p>
        <p>{{ t('footer.builtWith') }}</p>
      </div>
    </UContainer>
  </footer>
</template>
