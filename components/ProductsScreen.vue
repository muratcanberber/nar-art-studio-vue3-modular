<template>
  <div class="flex flex-col gap-6">
    <UCard class="border-slate-800/70 bg-slate-900/60 backdrop-blur">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold text-gray-100">Ürün Kataloğu</h2>
            <p class="text-sm text-gray-400">Shopier ve diğer kanallardaki aktif ürünleriniz.</p>
          </div>
          <UBadge variant="soft" color="gray" class="text-emerald-300" :label="`Toplam ${products.length} ürün`" />
        </div>
      </template>

      <div class="mb-4 grid gap-3 sm:grid-cols-3">
        <UCard
          v-for="metric in metrics"
          :key="metric.label"
          variant="soft"
          class="relative overflow-hidden border-slate-800/70"
          :class="metric.cardClass"
        >
          <UIcon :name="metric.icon" class="absolute right-4 top-4 text-2xl/none opacity-60" />
          <p class="text-xs uppercase tracking-[0.2em] text-gray-400">{{ metric.label }}</p>
          <p class="mt-3 text-2xl font-semibold text-gray-100">{{ metric.value }}</p>
        </UCard>
      </div>

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <UCard
          v-for="product in products"
          :key="product.id"
          variant="soft"
          class="flex flex-col gap-4 border-slate-800/70 bg-slate-900/60 backdrop-blur"
        >
          <div class="flex items-start gap-3">
            <img :src="product.image" alt="" class="h-20 w-20 rounded-lg object-cover" />
            <div class="flex flex-col gap-1">
              <span class="text-sm text-gray-400">{{ product.sku }}</span>
              <h3 class="text-base font-semibold text-gray-100">{{ product.name }}</h3>
              <span class="text-sm text-gray-400">{{ product.vendor }}</span>
            </div>
          </div>
          <div class="mt-4 flex items-center justify-between text-sm text-gray-400">
            <span>{{ formatCurrency(product.price) }}</span>
            <UBadge :label="statusLabel(product.status)" variant="subtle" :color="statusColor(product.status)" />
          </div>
          <div class="mt-2 text-xs text-gray-400">
            Stokta <span class="text-gray-100 font-medium">{{ product.stock }}</span> adet mevcut
          </div>
        </UCard>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
type Product = {
  id: number
  name: string
  sku: string
  price: number
  stock: number
  status: string
  image: string
  vendor: string
}

const { data } = await useAsyncData<Product[]>('products:list', () => $fetch('/api/products'))

const products = computed(() => data.value ?? [])

const metrics = computed(() => {
  const total = products.value.length
  const active = products.value.filter(product => product.status === 'Aktif').length
  const draft = products.value.filter(product => product.status === 'Taslak').length
  return [
    {
      label: 'Toplam Ürün',
      value: new Intl.NumberFormat('tr-TR').format(total),
      icon: 'i-lucide-layout-grid',
      cardClass: 'bg-gradient-to-br from-sky-500/15 via-sky-500/5 to-transparent'
    },
    {
      label: 'Aktif',
      value: new Intl.NumberFormat('tr-TR').format(active),
      icon: 'i-lucide-badge-check',
      cardClass: 'bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent'
    },
    {
      label: 'Taslak',
      value: new Intl.NumberFormat('tr-TR').format(draft),
      icon: 'i-lucide-pencil',
      cardClass: 'bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent'
    }
  ]
})

function formatCurrency(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0
  }).format(value)
}

function statusLabel(status: string) {
  if (status === 'Aktif') return 'Aktif'
  if (status === 'Taslak') return 'Taslak'
  return status
}

function statusColor(status: string) {
  if (status === 'Aktif') return 'emerald'
  if (status === 'Taslak') return 'gray'
  return 'sky'
}
</script>
