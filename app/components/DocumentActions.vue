<script setup lang="ts">
interface Props {
  /** Raw Markdown source, handed over as-is by the download button. */
  markdown: string
  /** Route of the server-generated PDF, e.g. `/cv.pdf`. */
  pdfPath: string
  /** Basename for downloaded files, without extension. */
  filename: string
  /** Human readable document name, used by the native share sheet. */
  documentTitle: string
}

const props = defineProps<Props>()

const { t } = useI18n()
const route = useRoute()
const toast = useToast()
const { public: publicConfig } = useRuntimeConfig()

/** Always the canonical URL, so a shared link never leaks localhost or tracking params. */
const shareUrl = computed(() => new URL(route.path, publicConfig.siteUrl).toString())

function downloadMarkdown() {
  const blob = new Blob([props.markdown], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `${props.filename}.md`
  link.click()

  URL.revokeObjectURL(url)
}

async function shareLink() {
  if (navigator.share) {
    try {
      await navigator.share({ title: props.documentTitle, url: shareUrl.value })
      return
    } catch (error) {
      // Dismissing the share sheet is not a failure; anything else falls back to the clipboard.
      if (error instanceof Error && error.name === 'AbortError') return
    }
  }

  await navigator.clipboard.writeText(shareUrl.value)
  toast.add({ title: t('document.linkCopied'), icon: 'i-lucide-check', color: 'success' })
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2 print:hidden">
    <!-- A real file served by the site, so the PDF is identical whatever the visitor's browser is. -->
    <UButton
      :to="pdfPath"
      :download="`${filename}.pdf`"
      external
      icon="i-lucide-file-down"
      color="primary"
    >
      {{ t('document.downloadPdf') }}
    </UButton>

    <UButton icon="i-lucide-file-code" color="neutral" variant="soft" @click="downloadMarkdown">
      {{ t('document.downloadMarkdown') }}
    </UButton>

    <UButton icon="i-lucide-share-2" color="neutral" variant="soft" @click="shareLink">
      {{ t('document.shareLink') }}
    </UButton>
  </div>
</template>
