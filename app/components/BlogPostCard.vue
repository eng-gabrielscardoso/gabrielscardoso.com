<script setup lang="ts">
defineProps<{
  title: string
  description: string
  date: string
  tags?: string[]
  to: string
}>()

const { t } = useI18n()
</script>

<template>
  <UCard class="glass group h-full transition-all hover:border-green-500/30">
    <time class="text-xs text-neutral-500">{{ date }}</time>
    <h2 class="mt-2 text-xl font-semibold text-neutral-100">{{ title }}</h2>
    <p class="mt-2 line-clamp-3 text-sm text-neutral-400">{{ description }}</p>
    <div v-if="tags?.length" class="mt-3 flex flex-wrap gap-1">
      <UBadge v-for="tag in tags" :key="tag" color="neutral" variant="subtle" size="sm">
        {{ tag }}
      </UBadge>
    </div>
    <UButton :to="to" color="primary" variant="soft" size="sm" class="mt-4">
      {{ t('blog.readMore') }}
    </UButton>
  </UCard>
</template>
