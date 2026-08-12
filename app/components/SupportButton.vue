<script setup lang="ts">
import { siteConfig } from '#shared/site.config'

const { t } = useI18n()

const isOpen = ref(false)
const copiedId = ref<string | null>(null)

const donations = siteConfig.donations

const accordionItems = computed(() =>
  donations.map((donation) => ({
    label: donation.label,
    icon: donation.icon,
    slot: donation.id,
  })),
)

async function copyAddress(address: string, id: string) {
  await navigator.clipboard.writeText(address)
  copiedId.value = id
  setTimeout(() => {
    copiedId.value = null
  }, 2000)
}
</script>

<template>
  <template v-if="donations.length">
    <UButton icon="i-lucide-coins" color="neutral" variant="ghost" square @click="isOpen = true">
      <span class="sr-only">{{ t('support.button') }}</span>
    </UButton>

    <UModal v-model:open="isOpen">
      <template #content>
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">{{ t('support.title') }}</h2>
          </template>

          <div class="space-y-4 text-sm text-neutral-300">
            <p>{{ t('support.intro1') }}</p>
            <p>{{ t('support.intro2') }}</p>
            <p>{{ t('support.intro3') }}</p>

            <UAccordion :items="accordionItems">
              <template v-for="donation in donations" :key="donation.id" #[donation.id]>
                <p class="mb-3 text-neutral-400">{{ t(donation.descriptionKey) }}</p>
                <UButton
                  block
                  color="primary"
                  variant="soft"
                  @click="copyAddress(donation.address, donation.id)"
                >
                  {{ copiedId === donation.id ? t('support.copied') : t('support.copyAddress') }}
                </UButton>
              </template>
            </UAccordion>
          </div>
        </UCard>
      </template>
    </UModal>
  </template>
</template>
