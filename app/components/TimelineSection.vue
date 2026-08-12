<script setup lang="ts">
import { formatDateRange } from '#shared/utils'
import type { SupportedLocale } from '#shared/utils'

export interface TimelineItem {
  id: string
  title: string
  subtitle: string
  description: string
  startDate: string
  endDate?: string | null
  badge?: string
}

defineProps<{
  items: TimelineItem[]
  title: string
}>()

const { t, locale } = useI18n()
</script>

<template>
  <section class="py-12">
    <h2 class="mb-8 text-2xl font-bold text-neutral-100">{{ title }}</h2>

    <div class="relative space-y-0">
      <div
        v-for="(item, index) in items"
        :key="item.id"
        class="relative flex gap-6 pb-10 last:pb-0"
      >
        <div class="flex flex-col items-center">
          <div class="h-3 w-3 rounded-full bg-green-500 ring-4 ring-green-500/20" />
          <div
            v-if="index < items.length - 1"
            class="mt-2 w-px flex-1 bg-neutral-800"
            aria-hidden="true"
          />
        </div>

        <Motion
          class="flex-1 pb-2"
          :initial="{ opacity: 0, x: -10 }"
          :while-in-view="{ opacity: 1, x: 0 }"
          :viewport="{ once: true }"
          :transition="{ duration: 0.4, delay: index * 0.05 }"
        >
          <UCard class="glass">
            <div class="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 class="font-semibold text-neutral-100">{{ item.title }}</h3>
                <p class="text-sm text-green-400">{{ item.subtitle }}</p>
              </div>
              <div class="flex flex-col items-end gap-1">
                <UBadge v-if="item.badge" color="neutral" variant="subtle" size="sm">
                  {{ item.badge }}
                </UBadge>
                <span class="text-xs text-neutral-500">
                  {{
                    formatDateRange(
                      item.startDate,
                      item.endDate,
                      t('about.present'),
                      locale as SupportedLocale,
                    )
                  }}
                </span>
              </div>
            </div>
            <div class="prose prose-invert prose-sm mt-3 max-w-none text-neutral-400">
              <MDC :value="item.description" tag="div" />
            </div>
          </UCard>
        </Motion>
      </div>
    </div>
  </section>
</template>
