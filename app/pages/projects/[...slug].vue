<script setup lang="ts">
import { formatDateRange } from '#shared/utils'
import type { SupportedLocale } from '#shared/utils'

const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()

const slug = computed(() => route.path)

const { data: project } = await useAsyncData(
  `project-${slug.value}`,
  () => queryLocalePage<ProjectPage, 'projects'>('projects', slug.value),
  { watch: [locale, slug] },
)

if (!project.value) {
  throw createError({ statusCode: 404, statusMessage: 'Project not found' })
}

useSeoMeta({
  title: project.value.title,
  description: project.value.description?.slice(0, 160),
})
</script>

<template>
  <article v-if="project" class="py-12">
    <UContainer class="max-w-3xl">
      <UButton
        :to="localePath('/projects')"
        color="neutral"
        variant="ghost"
        icon="i-lucide-arrow-left"
        class="mb-8"
      >
        {{ t('projects.title') }}
      </UButton>

      <header class="mb-8">
        <h1 class="text-4xl font-bold text-neutral-100">{{ project.title }}</h1>
        <p class="mt-2 text-green-400">{{ project.association }}</p>
        <p class="mt-2 text-sm text-neutral-500">
          {{
            formatDateRange(
              project.startDate,
              project.endDate,
              t('about.present'),
              locale as SupportedLocale,
            )
          }}
        </p>
      </header>

      <NuxtImg
        v-if="project.image"
        :src="project.image"
        :alt="project.title"
        class="mb-8 aspect-video w-full rounded-lg object-cover"
      />

      <div class="prose prose-invert max-w-none">
        <ContentRenderer :value="project" />
      </div>

      <div v-if="project.link" class="mt-8">
        <UButton
          :to="project.link"
          target="_blank"
          color="primary"
          trailing-icon="i-lucide-external-link"
        >
          {{ t('projects.viewProject') }}
        </UButton>
      </div>
    </UContainer>
  </article>
</template>
