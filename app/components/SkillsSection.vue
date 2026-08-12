<script setup lang="ts">
import { normalizeSkillIcons } from '#shared/skill-icons'

defineProps<{
  skills: Array<{
    name: string
    description: string
    icons: string[] | string
  }>
}>()

const { t } = useI18n()
</script>

<template>
  <section class="py-20">
    <UContainer>
      <Motion
        :initial="{ opacity: 0, y: 20 }"
        :while-in-view="{ opacity: 1, y: 0 }"
        :viewport="{ once: true }"
        :transition="{ duration: 0.5 }"
      >
        <h2 class="mb-12 text-center text-3xl font-bold text-neutral-100">
          {{ t('home.skillsTitle') }}
        </h2>
      </Motion>

      <div class="grid gap-6 md:grid-cols-2">
        <Motion
          v-for="(skill, index) in skills"
          :key="skill.name"
          :initial="{ opacity: 0, y: 20 }"
          :while-in-view="{ opacity: 1, y: 0 }"
          :viewport="{ once: true }"
          :transition="{ duration: 0.5, delay: index * 0.1 }"
        >
          <UCard class="glass h-full">
            <h3 class="mb-2 text-lg font-semibold text-neutral-100">{{ skill.name }}</h3>
            <p class="mb-4 text-sm text-neutral-400">{{ skill.description }}</p>
            <div v-if="normalizeSkillIcons(skill.icons).length" class="flex flex-wrap gap-2">
              <span
                v-for="icon in normalizeSkillIcons(skill.icons)"
                :key="icon"
                class="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-neutral-800/80 bg-neutral-900/60"
              >
                <UIcon :name="`i-logos-${icon}`" class="size-5" />
              </span>
            </div>
          </UCard>
        </Motion>
      </div>
    </UContainer>
  </section>
</template>
