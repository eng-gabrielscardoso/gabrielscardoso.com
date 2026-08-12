<script setup lang="ts">
import { siteConfig } from '#shared/site.config'
import { employmentTypeLabels, causeTypeLabels, gravatarUrl, sortByRecency } from '#shared/utils'

const profile = await useProfile()
const experiences =
  (await useContentItems<{
    title: string
    company: string
    employmentType: string
    location: string
    description: string
    startDate: string
    endDate?: string
  }>('experiences')) ?? []

const education =
  (await useContentItems<{
    degree: string
    course: string
    school: string
    description: string
    startDate: string
    endDate?: string
  }>('education')) ?? []

const volunteering =
  (await useContentItems<{
    role: string
    organisation: string
    cause: string
    description: string
    startDate: string
    endDate?: string
  }>('volunteering')) ?? []

const { t } = useI18n()

const experienceItems = computed(() =>
  sortByRecency(experiences).map((item, index) => ({
    id: `exp-${index}`,
    title: item.title,
    subtitle: `${item.company} · ${item.location}`,
    description: item.description,
    startDate: item.startDate,
    endDate: item.endDate,
    badge: employmentTypeLabels[item.employmentType] || item.employmentType,
  })),
)

const educationItems = computed(() =>
  sortByRecency(education).map((item, index) => ({
    id: `edu-${index}`,
    title: `${item.degree} in ${item.course}`,
    subtitle: item.school,
    description: item.description,
    startDate: item.startDate,
    endDate: item.endDate,
  })),
)

const volunteeringItems = computed(() =>
  sortByRecency(volunteering).map((item, index) => ({
    id: `vol-${index}`,
    title: item.role,
    subtitle: item.organisation,
    description: item.description,
    startDate: item.startDate,
    endDate: item.endDate,
    badge: causeTypeLabels[item.cause] || item.cause,
  })),
)

useSeoMeta({
  title: t('about.title'),
  description: profile?.headline,
})
</script>

<template>
  <div class="py-12">
    <UContainer>
      <div v-if="profile" class="mb-16 flex flex-col items-center gap-8 md:flex-row md:items-start">
        <UAvatar
          :src="gravatarUrl(siteConfig.avatar.gravatarHash, 200)"
          :alt="siteConfig.name"
          size="3xl"
          class="shrink-0 ring-2 ring-green-500/50"
        />
        <div class="flex-1 text-center md:text-left">
          <h1 class="text-4xl font-bold text-neutral-100">{{ siteConfig.name }}</h1>
          <p class="mt-2 text-lg text-green-400">{{ profile.headline }}</p>
          <p class="mt-1 text-neutral-500">{{ profile.location }}</p>
        </div>
      </div>

      <section v-if="profile?.biography" class="mb-16">
        <h2 class="mb-6 text-2xl font-bold text-neutral-100">{{ t('about.biography') }}</h2>
        <UCard class="glass">
          <div class="prose prose-invert max-w-none">
            <MDC :value="profile.biography" tag="div" />
          </div>
        </UCard>
      </section>

      <TimelineSection
        v-if="experienceItems.length"
        :title="t('about.experience')"
        :items="experienceItems"
      />

      <TimelineSection
        v-if="educationItems.length"
        :title="t('about.education')"
        :items="educationItems"
      />

      <TimelineSection
        v-if="volunteeringItems.length"
        :title="t('about.volunteering')"
        :items="volunteeringItems"
      />
    </UContainer>
  </div>
</template>
