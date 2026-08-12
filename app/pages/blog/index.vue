<script setup lang="ts">
const { locale, t } = useI18n()

const { data: posts } = await useAsyncData(
  `blog-list-${locale.value}`,
  () =>
    queryLocaleCollection('blog', (collection) =>
      queryCollection(collection).order('date', 'DESC').all(),
    ),
  { watch: [locale] },
)

useSeoMeta({
  title: t('blog.title'),
  description: t('blog.subtitle'),
})
</script>

<template>
  <div class="py-12">
    <UContainer>
      <div class="mb-12 text-center">
        <h1 class="text-4xl font-bold text-neutral-100">{{ t('blog.title') }}</h1>
        <p class="mt-4 text-neutral-400">{{ t('blog.subtitle') }}</p>
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        <Motion
          v-for="(post, index) in posts"
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
    </UContainer>
  </div>
</template>
