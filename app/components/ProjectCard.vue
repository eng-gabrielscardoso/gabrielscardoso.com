<script setup lang="ts">
import { formatDateRange, isActive } from '#shared/utils'
import type { SupportedLocale } from '#shared/utils'

defineProps<{
  title: string
  association: string
  description?: string
  link?: string
  image?: string
  startDate: string
  endDate?: string | null
  to?: string
}>()

const { t, locale } = useI18n()
</script>

<template>
  <UCard class="glass group h-full transition-all hover:border-green-500/30">
    <div v-if="image" class="mb-4 overflow-hidden rounded-lg">
      <NuxtImg
        :src="image"
        :alt="title"
        class="aspect-video w-full object-cover transition-transform group-hover:scale-105"
        loading="lazy"
      />
    </div>

    <div class="flex items-start justify-between gap-2">
      <div>
        <h2 class="font-semibold text-neutral-100">{{ title }}</h2>
        <p class="text-sm text-green-400">{{ association }}</p>
      </div>
      <UBadge v-if="isActive(endDate)" color="success" variant="subtle" size="sm"> Active </UBadge>
    </div>

    <p v-if="description" class="mt-3 line-clamp-3 text-sm text-neutral-400">
      {{ description }}
    </p>

    <p class="mt-2 text-xs text-neutral-500">
      {{ formatDateRange(startDate, endDate, t('about.present'), locale as SupportedLocale) }}
    </p>

    <div class="mt-4 flex gap-2">
      <UButton v-if="to" :to="to" color="primary" variant="soft" size="sm">
        {{ t('projects.readMore') }}
      </UButton>
      <UButton
        v-if="link"
        :to="link"
        target="_blank"
        color="neutral"
        variant="ghost"
        size="sm"
        trailing-icon="i-lucide-external-link"
      >
        {{ t('projects.viewProject') }}
      </UButton>
    </div>
  </UCard>
</template>
