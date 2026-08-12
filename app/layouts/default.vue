<script setup lang="ts">
const i18nHead = useLocaleHead({ seo: true })

useHead(() => ({
  htmlAttrs: {
    lang: i18nHead.value.htmlAttrs?.lang,
  },
  link: i18nHead.value.link,
  meta: i18nHead.value.meta,
}))
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader />
    <main class="page-ambient flex-1 pt-16">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
