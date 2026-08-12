<script setup lang="ts">
const props = defineProps<{
  error: {
    statusCode: number
    statusMessage?: string
  }
}>()

const { t } = useI18n()
const localePath = useLocalePath()

const isNotFound = computed(() => props.error.statusCode === 404)
const isServerError = computed(() => props.error.statusCode >= 500)

const imageSrc = computed(() => {
  if (isNotFound.value) return '/images/404.png'
  if (isServerError.value) return '/images/503.png'
  return '/images/404.png'
})
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center px-4 text-center">
    <NuxtImg :src="imageSrc" alt="" class="mb-8 max-w-md" />
    <h1 class="text-3xl font-bold text-neutral-100">
      {{ isNotFound ? t('error.notFound') : t('error.serverError') }}
    </h1>
    <p class="mt-4 max-w-md text-neutral-400">
      {{ isNotFound ? t('error.notFoundDesc') : t('error.serverErrorDesc') }}
    </p>
    <UButton :to="localePath('/')" color="primary" class="mt-8">
      {{ t('error.goHome') }}
    </UButton>
  </div>
</template>
