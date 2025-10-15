<template>
  <div class="flex flex-col gap-6">
    <UCard class="border-slate-800/70 bg-slate-900/60 backdrop-blur">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-semibold text-gray-100">Stok Durumu</h2>
            <p class="text-sm text-gray-400">Kritik stok eşiğini yaklaşan malzemeleri takip edin.</p>
          </div>
          <UBadge variant="soft" color="gray" class="text-emerald-300" :label="`Toplam kalem: ${rows.length}`" />
        </div>
      </template>

      <div class="mb-4 grid gap-3 sm:grid-cols-2">
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

      <UTable :columns="columns" :rows="tableRows" :ui="tableUi">
        <template #name-data="{ row }">
          <div class="flex flex-col">
            <span class="font-medium text-gray-100">{{ row.name }}</span>
            <span class="text-xs text-gray-400">Birim: {{ row.unit }}</span>
          </div>
        </template>
        <template #in_stock-data="{ row }">
          <span class="font-semibold text-gray-100">{{ row.in_stock }}</span>
        </template>
        <template #status-data="{ row }">
          <UBadge :label="row.statusLabel" :color="row.isLow ? 'rose' : 'emerald'" variant="subtle" />
        </template>
      </UTable>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
type Material = {
  id: number
  name: string
  unit: string
  in_stock: number
  threshold: number
}

const { data } = await useAsyncData<Material[]>('materials:list', () => $fetch('/api/materials'))

const columns = [
  { key: 'name', label: 'Malzeme' },
  { key: 'in_stock', label: 'Mevcut' },
  { key: 'threshold', label: 'Eşik' },
  { key: 'status', label: 'Durum' }
]

const rows = computed(() => data.value ?? [])

const metrics = computed(() => {
  const total = rows.value.length
  const low = rows.value.filter(item => item.in_stock <= item.threshold).length
  return [
    {
      label: 'Toplam Kalem',
      value: new Intl.NumberFormat('tr-TR').format(total),
      icon: 'i-lucide-warehouse',
      cardClass: 'bg-gradient-to-br from-sky-500/15 via-sky-500/5 to-transparent'
    },
    {
      label: 'Kritik Eşik',
      value: new Intl.NumberFormat('tr-TR').format(low),
      icon: 'i-lucide-alert-triangle',
      cardClass: 'bg-gradient-to-br from-rose-500/15 via-rose-500/5 to-transparent'
    }
  ]
})

const tableUi = {
  tr: {
    base: 'border-b border-slate-800/60 hover:bg-slate-800/60 transition-colors'
  },
  th: {
    base: 'text-slate-400 uppercase tracking-[0.2em] text-xs',
    padding: 'py-3 px-4'
  },
  td: {
    base: 'py-3 px-4 text-sm text-slate-200'
  }
}

const tableRows = computed(() =>
  rows.value.map(item => {
    const isLow = item.in_stock <= item.threshold
    return {
      ...item,
      statusLabel: isLow ? 'Eşik altında' : 'Yeterli',
      isLow
    }
  })
)
</script>
