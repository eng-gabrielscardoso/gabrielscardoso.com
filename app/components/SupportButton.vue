<script setup lang="ts">
import { siteConfig } from '#shared/site.config'
import {
  ETH_DEFAULT_AMOUNT,
  ETH_DONATION_PRESETS,
  METAMASK_DOWNLOAD_URL,
  isUserRejected,
  isValidEthAmount,
  shortenAddress,
} from '#shared/ethereum'

const { t } = useI18n()
const toast = useToast()
const { account, hasWallet, pending, connect, send, refresh } = useMetaMask()

const isOpen = ref(false)
const copiedId = ref<string | null>(null)
const amount = ref(ETH_DEFAULT_AMOUNT)

const donations = siteConfig.donations

const accordionItems = computed(() =>
  donations.map((donation) => ({
    label: donation.label,
    icon: donation.icon,
    slot: donation.id,
  })),
)

const amountIsValid = computed(() => isValidEthAmount(amount.value))

function openModal() {
  refresh()
  isOpen.value = true
}

async function copyAddress(address: string, id: string) {
  await navigator.clipboard.writeText(address)
  copiedId.value = id
  setTimeout(() => {
    copiedId.value = null
  }, 2000)
}

function notifyWalletError(error: unknown) {
  if (isUserRejected(error)) {
    toast.add({ title: t('support.txRejected'), color: 'neutral' })
    return
  }

  toast.add({ title: t('support.sendError'), color: 'error' })
}

async function connectWallet() {
  try {
    await connect()
  } catch (error) {
    notifyWalletError(error)
  }
}

async function sendDonation(to: string) {
  if (!amountIsValid.value) {
    toast.add({ title: t('support.invalidAmount'), color: 'error' })
    return
  }

  try {
    await send(to, amount.value)
    toast.add({ title: t('support.txSent'), color: 'success', icon: 'i-lucide-check' })
  } catch (error) {
    notifyWalletError(error)
  }
}
</script>

<template>
  <template v-if="donations.length">
    <UButton icon="i-lucide-coins" color="neutral" variant="ghost" square @click="openModal">
      <span class="sr-only">{{ t('support.button') }}</span>
    </UButton>

    <UModal v-model:open="isOpen" class="max-h-[85dvh]">
      <template #content>
        <UCard
          :ui="{
            root: 'flex max-h-[85dvh] flex-col overflow-hidden',
            header: 'shrink-0',
            body: 'min-h-0 flex-1 overflow-y-auto overscroll-contain',
          }"
        >
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

                <template v-if="donation.method === 'metamask'">
                  <div class="space-y-4">
                    <div
                      class="space-y-3 rounded-lg border border-neutral-800 bg-neutral-900/40 p-3"
                    >
                      <div class="flex items-baseline justify-between gap-3">
                        <span class="text-xs font-medium text-neutral-400">{{
                          t('support.amount')
                        }}</span>
                        <span v-if="account" class="truncate text-xs text-neutral-500">
                          {{ t('support.connectedAs', { account: shortenAddress(account) }) }}
                        </span>
                      </div>

                      <UInput
                        v-model="amount"
                        inputmode="decimal"
                        autocomplete="off"
                        :placeholder="ETH_DEFAULT_AMOUNT"
                        class="w-full"
                      >
                        <template #trailing>
                          <span class="text-xs font-medium text-neutral-400">ETH</span>
                        </template>
                      </UInput>

                      <div class="grid grid-cols-4 gap-1.5">
                        <UButton
                          v-for="preset in ETH_DONATION_PRESETS"
                          :key="preset"
                          size="sm"
                          class="justify-center px-0"
                          :color="amount === preset ? 'primary' : 'neutral'"
                          :variant="amount === preset ? 'solid' : 'ghost'"
                          @click="amount = preset"
                        >
                          {{ preset }}
                        </UButton>
                      </div>
                    </div>

                    <div class="space-y-2">
                      <UButton
                        v-if="!hasWallet"
                        block
                        color="primary"
                        :to="METAMASK_DOWNLOAD_URL"
                        target="_blank"
                        icon="i-logos-metamask-icon"
                      >
                        {{ t('support.installMetaMask') }}
                      </UButton>

                      <UButton
                        v-else-if="!account"
                        block
                        color="primary"
                        icon="i-lucide-wallet"
                        :loading="pending === 'connect'"
                        :disabled="pending !== null"
                        @click="connectWallet"
                      >
                        {{
                          pending === 'connect'
                            ? t('support.connecting')
                            : t('support.connectWallet')
                        }}
                      </UButton>

                      <UButton
                        v-else
                        block
                        color="primary"
                        icon="i-logos-metamask-icon"
                        :loading="pending === 'send'"
                        :disabled="pending !== null || !amountIsValid"
                        @click="sendDonation(donation.address)"
                      >
                        {{ pending === 'send' ? t('support.sending') : t('support.send') }}
                      </UButton>

                      <UButton
                        block
                        color="neutral"
                        variant="ghost"
                        size="sm"
                        @click="copyAddress(donation.address, donation.id)"
                      >
                        {{
                          copiedId === donation.id ? t('support.copied') : t('support.copyAddress')
                        }}
                      </UButton>
                    </div>

                    <p v-if="!hasWallet" class="text-xs text-neutral-500">
                      {{ t('support.noWallet') }}
                    </p>
                  </div>
                </template>

                <template v-else>
                  <p class="mb-3 text-xs text-neutral-500">{{ t('support.bitcoinHint') }}</p>
                  <UButton
                    block
                    color="primary"
                    variant="soft"
                    @click="copyAddress(donation.address, donation.id)"
                  >
                    {{ copiedId === donation.id ? t('support.copied') : t('support.copyAddress') }}
                  </UButton>
                </template>
              </template>
            </UAccordion>
          </div>
        </UCard>
      </template>
    </UModal>
  </template>
</template>
