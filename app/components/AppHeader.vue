<script setup lang="ts">
import { repositoryUrl, siteConfig } from '#shared/site.config'

const { t, locale, locales } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()

const navItems = computed(() => [
  { label: t('nav.home'), to: localePath('/'), icon: 'i-lucide-house' },
  { label: t('nav.about'), to: localePath('/about'), icon: 'i-lucide-user' },
  { label: t('nav.projects'), to: localePath('/projects'), icon: 'i-lucide-folder-kanban' },
  { label: t('nav.blog'), to: localePath('/blog'), icon: 'i-lucide-newspaper' },
  { label: t('nav.contact'), to: localePath('/contact'), icon: 'i-lucide-mail' },
])

/** Documents get their own group, highlighted in the primary colour: they are what recruiters open. */
const documentItems = computed(() => [
  { label: t('nav.documents'), type: 'label' as const },
  ...siteConfig.documents.map((document) => ({
    label: t(document.labelKey),
    icon: document.icon,
    color: 'primary' as const,
    ...(document.to
      ? { to: localePath(document.to) }
      : { href: document.href, target: '_blank' as const }),
  })),
])

const menuItems = computed(() => [
  navItems.value.map((item) => ({ label: item.label, icon: item.icon, to: item.to })),
  documentItems.value,
])

const availableLocales = computed(() =>
  locales.value.filter((l) => typeof l !== 'string' && l.code !== locale.value),
)

const localeItems = computed(() => [
  availableLocales.value.map((l) => {
    const code = typeof l === 'string' ? l : l.code
    return {
      label: typeof l === 'string' ? l : l.name,
      to: { path: switchLocalePath(code) },
    }
  }),
])
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md print:hidden"
  >
    <UContainer class="flex h-16 items-center justify-between">
      <div class="flex items-center gap-1">
        <UDropdownMenu :items="menuItems">
          <UButton icon="i-lucide-menu" color="neutral" variant="ghost" square>
            <span class="sr-only">{{ t('nav.menu') }}</span>
          </UButton>
        </UDropdownMenu>

        <SupportButton />
      </div>

      <NuxtLink
        :to="localePath('/')"
        class="font-semibold text-neutral-100 transition-colors hover:text-green-400"
      >
        {{ siteConfig.shortName }}
      </NuxtLink>

      <div class="flex items-center gap-1">
        <UDropdownMenu :items="localeItems">
          <UButton icon="i-lucide-languages" color="neutral" variant="ghost" square>
            <span class="sr-only">{{ t('locale.switch') }}</span>
          </UButton>
        </UDropdownMenu>

        <UButton
          icon="i-lucide-github"
          color="neutral"
          variant="ghost"
          square
          :to="repositoryUrl"
          target="_blank"
        >
          <span class="sr-only">{{ t('nav.github') }}</span>
        </UButton>
      </div>
    </UContainer>
  </header>
</template>
