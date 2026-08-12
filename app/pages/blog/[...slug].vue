<script setup lang="ts">
const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()

const slug = computed(() => route.path)

const { data: post } = await useAsyncData(
  `blog-post-${slug.value}`,
  () => queryLocalePage<BlogPost, 'blog'>('blog', slug.value),
  { watch: [locale, slug] },
)

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found' })
}

useSeoMeta({
  title: post.value.title,
  description: post.value.description,
})
</script>

<template>
  <article v-if="post" class="py-12">
    <UContainer class="max-w-3xl">
      <UButton
        :to="localePath('/blog')"
        color="neutral"
        variant="ghost"
        icon="i-lucide-arrow-left"
        class="mb-8"
      >
        {{ t('blog.backToBlog') }}
      </UButton>

      <header class="mb-8">
        <time class="text-sm text-neutral-500">{{ post.date }}</time>
        <h1 class="mt-2 text-4xl font-bold text-neutral-100">{{ post.title }}</h1>
        <p class="mt-4 text-lg text-neutral-400">{{ post.description }}</p>
        <div v-if="post.tags?.length" class="mt-4 flex flex-wrap gap-2">
          <UBadge v-for="tag in post.tags" :key="tag" color="neutral" variant="subtle">
            {{ tag }}
          </UBadge>
        </div>
      </header>

      <div class="prose prose-invert max-w-none">
        <ContentRenderer :value="post" />
      </div>
    </UContainer>
  </article>
</template>
