<template>
  <div class="flex flex-col gap-6">
    <UCard class="border-slate-800/70 bg-slate-900/60 backdrop-blur">
      <template #header>
        <div>
          <h2 class="text-lg font-semibold text-gray-100">Maliyet Analizi</h2>
          <p class="text-sm text-gray-400">Planlanan ve gerçekleşen maliyetlerin karşılaştırması.</p>
        </div>
      </template>

      <div class="grid gap-4 md:grid-cols-2">
        <UCard
          v-for="item in costRows"
          :key="item.id"
          variant="soft"
          class="border-slate-800/70 bg-slate-900/60 backdrop-blur"
        >
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-400">{{ item.name }}</span>
            <span
              class="text-sm font-medium"
              :class="item.actual > item.planned ? 'text-rose-300' : item.actual === item.planned ? 'text-gray-300' : 'text-emerald-300'"
            >
              {{ diffLabel(item) }}
            </span>
          </div>
          <div class="mt-3 flex flex-col gap-2">
            <div class="flex items-center justify-between text-xs text-gray-400">
              <span>Planlanan</span>
              <span>{{ formatCurrency(item.planned) }}</span>
            </div>
            <UProgress :value="item.plannedProgress" color="cyan" size="xs" />
            <div class="flex items-center justify-between text-xs text-gray-400">
              <span>Gerçekleşen</span>
              <span>{{ formatCurrency(item.actual) }}</span>
            </div>
            <UProgress :value="item.actualProgress" :color="item.actual > item.planned ? 'rose' : 'emerald'" size="xs" />
          </div>
        </UCard>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
type CostRow = {
  id: number
  name: string
  planned: number
  actual: number
}

const { data } = await useAsyncData<CostRow[]>('costs:list', () => $fetch('/api/costs'))

const costRows = computed(() => {
  const rows = data.value ?? []
  const maxValue = Math.max(...rows.map(row => Math.max(row.planned, row.actual)), 1)

  return rows.map(row => ({
    ...row,
    plannedProgress: Math.round((row.planned / maxValue) * 100),
    actualProgress: Math.round((row.actual / maxValue) * 100)
  }))
})

function formatCurrency(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0
  }).format(value)
}

function diffLabel(item: CostRow) {
  const diff = item.actual - item.planned
  if (diff === 0) return 'Plan ile uyumlu'
  return diff > 0 ? `+${formatCurrency(diff)}` : formatCurrency(diff)
}
</script>
