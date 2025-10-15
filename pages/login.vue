<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-950 px-4">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="flex flex-col gap-2 text-center">
          <span class="text-xs uppercase tracking-[0.3em] text-gray-500">Nar Art Studio</span>
          <h1 class="text-xl font-semibold text-gray-100">Yönetim Paneline Giriş</h1>
          <p class="text-sm text-gray-400">Devam etmek için kayıtlı kullanıcı bilgilerinizle giriş yapın.</p>
        </div>
      </template>

      <UForm :state="form" class="space-y-4" @submit="handleSubmit">
        <UFormGroup label="Kullanıcı adı" name="username">
          <UInput v-model="form.username" placeholder="admin" autocomplete="username" />
        </UFormGroup>

        <UFormGroup label="Şifre" name="password">
          <UInput v-model="form.password" type="password" placeholder="••••••••" autocomplete="current-password" />
        </UFormGroup>

        <UAlert
          v-if="errorMessage"
          icon="i-lucide-alert-triangle"
          color="red"
          variant="soft"
          :title="errorMessage"
        />

        <UButton type="submit" block :loading="loading" icon="i-lucide-log-in">
          Giriş yap
        </UButton>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const form = reactive({
  username: '',
  password: ''
})

const loading = ref(false)
const errorMessage = ref('')

async function handleSubmit(event: Event) {
  event.preventDefault()
  if (loading.value) return

  errorMessage.value = ''
  loading.value = true

  try {
    const response = await $fetch<{ id: number; username: string }>('/api/auth/login', {
      method: 'POST',
      body: {
        username: form.username,
        password: form.password
      }
    })

    const userState = useState('auth-user', () => null as null | { id: number; username: string })
    userState.value = response

    await navigateTo('/')
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage ?? 'Giriş başarısız. Bilgilerinizi kontrol edin.'
  } finally {
    loading.value = false
  }
}
</script>
