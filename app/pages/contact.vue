<script setup lang="ts">
import { getFeaturedSocials, siteConfig } from '#shared/site.config'

const { t } = useI18n()
const localePath = useLocalePath()

const featuredSocials = getFeaturedSocials()

const documents = computed(() =>
  siteConfig.documents.map((document) => ({
    id: document.id,
    label: t(document.labelKey),
    icon: document.icon,
    to: document.to ? localePath(document.to) : document.href,
    external: !document.to,
  })),
)

useSeoMeta({
  title: t('contact.title'),
  description: t('contact.subtitle'),
})
</script>

<template>
  <div class="py-12">
    <UContainer class="max-w-2xl">
      <div class="mb-8 text-center">
        <h1 class="text-4xl font-bold text-neutral-100">{{ t('contact.title') }}</h1>
        <p class="mt-4 text-neutral-400">{{ t('contact.subtitle') }}</p>
      </div>

      <div class="mb-8 flex flex-wrap justify-center gap-3">
        <UButton
          v-for="social in featuredSocials"
          :key="social.id"
          :to="social.href"
          target="_blank"
          :icon="social.icon"
          color="neutral"
          variant="soft"
        >
          {{ social.label }}
        </UButton>

        <UButton
          v-for="document in documents"
          :key="document.id"
          :to="document.to"
          :target="document.external ? '_blank' : undefined"
          :icon="document.icon"
          :trailing-icon="document.external ? 'i-lucide-external-link' : undefined"
          color="primary"
          variant="soft"
        >
          {{ document.label }}
        </UButton>
      </div>

      <UCard class="glass">
        <h2 class="sr-only">{{ t('contact.formTitle') }}</h2>
        <ContactForm />
      </UCard>
    </UContainer>
  </div>
</template>
