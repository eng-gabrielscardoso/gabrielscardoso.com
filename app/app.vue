<script setup lang="ts">
import { siteConfig } from '#shared/site.config'

const toaster = {
  label: 'Site notifications ({hotkey})',
}

const siteUrl = useRuntimeConfig().public.siteUrl

// Site-wide social sharing defaults; pages with richer context override them.
useSeoMeta({
  ogImage: `${siteUrl}/images/og-image.jpg`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: siteConfig.name,
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <UApp :toaster="toaster">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
