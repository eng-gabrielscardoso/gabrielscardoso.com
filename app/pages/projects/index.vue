<script setup lang="ts">
import { isActive } from '#shared/utils'

const { locale, t } = useI18n()

const { data: projects } = await useAsyncData(
  `projects-list-${locale.value}`,
  () =>
    queryLocaleCollection('projects', (collection) =>
      queryCollection(collection).order('startDate', 'DESC').all(),
    ),
  { watch: [locale] },
)

const stats = computed(() => ({
  total: projects.value?.length ?? 0,
  active: projects.value?.filter((p) => isActive(p.endDate)).length ?? 0,
}))

useSeoMeta({
  title: t('projects.title'),
  description: t('projects.subtitle'),
})
</script>

<template>
  <div class="py-12">
    <UContainer>
      <div class="mb-12 text-center">
        <h1 class="text-4xl font-bold text-neutral-100">{{ t('projects.title') }}</h1>
        <p class="mt-4 text-neutral-400">{{ t('projects.subtitle') }}</p>
      </div>

      <div class="mb-12 grid gap-4 sm:grid-cols-2">
        <UCard class="glass text-center">
          <p class="text-3xl font-bold text-green-400">{{ stats.total }}</p>
          <p class="text-sm text-neutral-400">{{ t('projects.total') }}</p>
        </UCard>
        <UCard class="glass text-center">
          <p class="text-3xl font-bold text-green-300">{{ stats.active }}</p>
          <p class="text-sm text-neutral-400">{{ t('projects.active') }}</p>
        </UCard>
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        <ProjectCard
          v-for="project in projects"
          :key="project.path"
          :title="project.title"
          :association="project.association"
          :link="project.link"
          :image="project.image"
          :start-date="project.startDate"
          :end-date="project.endDate"
          :to="project.path"
        />
      </div>
    </UContainer>
  </div>
</template>
