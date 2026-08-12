<script setup lang="ts">
import { siteConfig } from '#shared/site.config'
import { gravatarUrl } from '#shared/utils'

const props = defineProps<{
  headline?: string
  location: string
}>()

const { t } = useI18n()
const localePath = useLocalePath()

const avatarSrc = gravatarUrl(siteConfig.avatar.gravatarHash, 512)
</script>

<template>
  <section class="flex min-h-[calc(100vh-4rem)] items-center px-4">
    <UContainer class="max-w-6xl">
      <div class="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <Motion
          class="order-2 text-center lg:order-1 lg:text-left"
          :initial="{ opacity: 0, x: -24 }"
          :animate="{ opacity: 1, x: 0 }"
          :transition="{ duration: 0.6 }"
        >
          <h1
            class="font-sans text-4xl font-bold tracking-tight text-neutral-100 md:text-5xl lg:text-6xl"
          >
            {{ t('home.greeting') }}
            <br />
            {{ t('home.iam') }}
            <span class="text-gradient">{{ siteConfig.nickname }}</span>
            <br />
            {{ t('home.role') }}
          </h1>

          <p v-if="props.headline" class="mt-5 text-lg text-neutral-300 md:text-xl">
            {{ props.headline }}
          </p>

          <p class="mt-5 text-lg text-neutral-400 md:text-xl">
            {{ t('home.locationPrefix') }}
            <span class="font-medium text-green-400">{{ props.location }}</span
            >.
          </p>

          <div class="mt-8 flex justify-center lg:justify-start">
            <UButton :to="localePath('/contact')" size="lg" color="primary">
              {{ t('home.cta') }}
            </UButton>
          </div>
        </Motion>

        <Motion
          class="order-1 flex justify-center lg:order-2 lg:justify-end"
          :initial="{ opacity: 0, x: 24 }"
          :animate="{ opacity: 1, x: 0 }"
          :transition="{ duration: 0.6, delay: 0.1 }"
        >
          <div class="relative mx-auto size-48 sm:size-52 lg:size-60">
            <div
              class="absolute -inset-3 rounded-full bg-green-500/10 blur-2xl"
              aria-hidden="true"
            />

            <div
              class="relative size-full overflow-hidden rounded-full ring-2 ring-green-500/30 shadow-xl shadow-black/40"
            >
              <img
                :src="avatarSrc"
                :alt="siteConfig.name"
                width="240"
                height="240"
                class="size-full object-cover"
                fetchpriority="high"
              />
            </div>

            <span
              class="absolute right-[11%] bottom-[11%] size-3.5 rounded-full bg-green-500 ring-4 ring-neutral-950"
              aria-hidden="true"
            />
          </div>
        </Motion>
      </div>
    </UContainer>
  </section>
</template>
