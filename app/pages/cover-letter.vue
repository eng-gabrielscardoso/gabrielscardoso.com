<script setup lang="ts">
import { getDocument } from '#shared/site.config'

const related = getDocument('cv')
</script>

<template>
  <SiteDocumentView
    collection="coverLetter"
    label-key="nav.coverLetter"
    :related="related"
    related-hint-key="document.cvHint"
  />
</template>
