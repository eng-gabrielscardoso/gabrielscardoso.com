<script setup lang="ts">
import { getDocument, getFeaturedSocials } from '#shared/site.config'

const { t } = useI18n()

const featuredSocials = getFeaturedSocials()
const cv = getDocument('cv')

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
          v-if="cv"
          :to="cv.href"
          target="_blank"
          :icon="cv.icon"
          color="neutral"
          variant="soft"
        >
          {{ t(cv.labelKey) }}
        </UButton>
      </div>

      <UCard class="glass">
        <h2 class="sr-only">{{ t('contact.formTitle') }}</h2>
        <ContactForm />
      </UCard>
    </UContainer>
  </div>
</template>
