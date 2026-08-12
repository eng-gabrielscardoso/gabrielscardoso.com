<script setup lang="ts">
import { siteConfig } from '#shared/site.config'

const profile = await useProfile()
const skills =
  (await useContentItems<{ name: string; description: string; icons: string[] }>('skills')) ?? []

const { locale } = useI18n()
const localePath = useLocalePath()

const { data: localizedProjects } = await useAsyncData(
  `featured-projects-${locale.value}`,
  () =>
    queryLocaleCollection('projects', (collection) =>
      queryCollection(collection).where('featured', '=', true).all(),
    ),
  { watch: [locale] },
)

const { data: latestPosts } = await useAsyncData(
  `latest-posts-${locale.value}`,
  async () => {
    const items = await queryLocaleCollection('blog', (collection) =>
      queryCollection(collection).order('date', 'DESC').all(),
    )
    return items.slice(0, 3)
  },
  { watch: [locale] },
)

useSeoMeta({
  title: 'Welcome',
  description: profile?.headline || siteConfig.description,
})
</script>

<template>
  <div>
    <HeroSection v-if="profile" :headline="profile.headline" :location="profile.location" />

    <SkillsSection v-if="skills.length" :skills="skills" />

    <section v-if="localizedProjects?.length" class="pb-20">
      <UContainer>
        <h2 class="mb-8 text-center text-3xl font-bold text-neutral-100">
          {{ $t('home.featuredProjects') }}
        </h2>
        <div class="grid gap-6 md:grid-cols-2">
          <ProjectCard
            v-for="project in localizedProjects"
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
        <div class="mt-8 text-center">
          <UButton :to="localePath('/projects')" color="primary" variant="soft">
            {{ $t('home.viewAllProjects') }}
          </UButton>
        </div>
      </UContainer>
    </section>

    <section v-if="latestPosts?.length" class="pb-20">
      <UContainer>
        <h2 class="mb-8 text-center text-3xl font-bold text-neutral-100">
          {{ $t('home.lastPublications') }}
        </h2>
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Motion
            v-for="(post, index) in latestPosts"
            :key="post.path"
            :initial="{ opacity: 0, y: 20 }"
            :while-in-view="{ opacity: 1, y: 0 }"
            :viewport="{ once: true }"
            :transition="{ duration: 0.4, delay: index * 0.1 }"
          >
            <BlogPostCard
              :title="post.title"
              :description="post.description"
              :date="post.date"
              :tags="post.tags"
              :to="post.path"
            />
          </Motion>
        </div>
        <div class="mt-8 text-center">
          <UButton :to="localePath('/blog')" color="primary" variant="soft">
            {{ $t('home.viewAllPosts') }}
          </UButton>
        </div>
      </UContainer>
    </section>
  </div>
</template>
