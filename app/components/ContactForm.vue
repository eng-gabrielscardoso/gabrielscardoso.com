<script setup lang="ts">
import { contactSchema } from '#shared/contact.schema'

const { t } = useI18n()
const toast = useToast()

const emailPlaceholder = 'john.doe@example.com'

const state = reactive({
  name: '',
  email: '',
  subject: '',
  message: '',
  website: '',
})

const isSubmitting = ref(false)
const errors = ref<Record<string, string>>({})

async function onSubmit() {
  errors.value = {}
  const result = contactSchema.safeParse(state)

  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0]
      if (typeof field === 'string') {
        errors.value[field] = issue.message
      }
    }
    return
  }

  isSubmitting.value = true

  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: result.data,
    })

    toast.add({
      title: t('contact.success'),
      color: 'success',
    })

    state.name = ''
    state.email = ''
    state.subject = ''
    state.message = ''
    state.website = ''
  } catch (error: unknown) {
    const fetchError = error as { data?: { message?: string; statusMessage?: string } }
    const message = fetchError.data?.message || fetchError.data?.statusMessage || t('contact.error')

    toast.add({
      title: message,
      color: 'error',
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form class="w-full space-y-4" novalidate @submit.prevent="onSubmit">
    <div class="hidden" aria-hidden="true">
      <UInput v-model="state.website" tabindex="-1" autocomplete="off" name="website" />
    </div>

    <UFormField class="w-full" :label="t('contact.name')" :error="errors.name" required>
      <UInput
        v-model="state.name"
        class="w-full"
        name="name"
        autocomplete="name"
        leading-icon="i-lucide-user"
        :placeholder="t('contact.placeholders.name')"
        required
      />
    </UFormField>

    <UFormField class="w-full" :label="t('contact.email')" :error="errors.email" required>
      <UInput
        v-model="state.email"
        class="w-full"
        name="email"
        type="email"
        autocomplete="email"
        leading-icon="i-lucide-mail"
        :placeholder="emailPlaceholder"
        required
      />
    </UFormField>

    <UFormField class="w-full" :label="t('contact.subject')" :error="errors.subject" required>
      <UInput
        v-model="state.subject"
        class="w-full"
        name="subject"
        leading-icon="i-lucide-message-square"
        :placeholder="t('contact.placeholders.subject')"
        required
      />
    </UFormField>

    <UFormField class="w-full" :label="t('contact.message')" :error="errors.message" required>
      <UTextarea
        v-model="state.message"
        class="w-full"
        name="message"
        leading-icon="i-lucide-pencil-line"
        :placeholder="t('contact.placeholders.message')"
        :rows="6"
        required
      />
    </UFormField>

    <UButton type="submit" color="primary" block :loading="isSubmitting" :disabled="isSubmitting">
      {{ isSubmitting ? t('contact.sending') : t('contact.send') }}
    </UButton>
  </form>
</template>
