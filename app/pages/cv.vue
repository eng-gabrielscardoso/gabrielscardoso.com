<script setup lang="ts">
import { getDocument } from '#shared/site.config'

const related = getDocument('coverLetter')
</script>

<template>
  <SiteDocumentView
    collection="cv"
    label-key="nav.cv"
    :related="related"
    related-hint-key="document.coverLetterHint"
  />
</template>
