<script setup lang="ts">
const toaster = {
  label: 'Site notifications ({hotkey})',
}
</script>

<template>
  <UApp :toaster="toaster">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
