<template>
  <div class="space-y-6">
    <section class="glass-panel flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-lg font-semibold text-white">Urun Envanteri</h2>
        <p class="text-sm text-white/60">
          Shopier API uzerinden gelen urunleri goruntuleyin ve gerektiginde senkronizasyon baslatin.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="syncProducts"
          :disabled="productsStore.isSyncing"
          class="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition"
          :class="productsStore.isSyncing
            ? 'border border-white/15 bg-white/10 text-white/60 cursor-not-allowed'
            : 'bg-gradient-to-r from-primary-500 to-emerald-400 text-slate-900 shadow-lg shadow-primary-500/30 hover:from-primary-400 hover:to-emerald-300'"
        >
          <RefreshCw class="animate-spin" :size="16" v-if="productsStore.isSyncing" />
          <RefreshCw :size="16" v-else />
          {{ productsStore.isSyncing ? 'Senkronize ediliyor...' : 'Shopier ile Senkronize Et' }}
        </button>
        <button
          @click="exportProducts"
          class="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-primary-400/60 hover:text-primary-100"
        >
          <Download :size="16" /> CSV
        </button>
      </div>
    </section>

    <section class="glass-panel space-y-4">
      <div class="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.3em] text-white/40">
        <span>Toplam urun: <strong class="text-white/80">{{ productsStore.items.length }}</strong></span>
        <span>Son senkron: <strong class="text-white/80">{{ lastSyncText }}</strong></span>
      </div>
      <div
        v-if="productsStore.lastSyncError"
        class="rounded-xl border border-rose-300/40 bg-rose-500/15 px-4 py-3 text-sm text-rose-100"
      >
        {{ productsStore.lastSyncError }}
      </div>

      <div class="overflow-x-auto scroll-thin">
        <table class="table-shell min-w-[960px]">
          <thead class="text-xs uppercase tracking-[0.25em] text-white/40">
            <tr>
              <th class="rounded-l-xl bg-white/5 px-4 py-3">Urun</th>
              <th class="bg-white/5 px-4 py-3">Kategori</th>
              <th class="bg-white/5 px-4 py-3">SKU</th>
              <th class="bg-white/5 px-4 py-3 text-center">Durum</th>
              <th class="bg-white/5 px-4 py-3 text-right">Fiyat</th>
              <th class="rounded-r-xl bg-white/5 px-4 py-3 text-right">Guncelleme</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="product in productsStore.items"
              :key="product.id"
              class="rounded-2xl border border-white/10 bg-white/5 align-top transition hover:border-primary-400/50"
            >
              <td class="rounded-l-2xl px-4 py-4">
                <div class="flex gap-3">
                  <img :src="product.image" alt="" class="h-14 w-14 rounded-xl object-cover ring-2 ring-white/10" />
                  <div>
                    <div class="font-semibold text-white">{{ product.title }}</div>
                    <div class="text-xs text-white/40">ID: {{ product.id }}</div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4 text-white/80">{{ product.category }}</td>
              <td class="px-4 py-4 text-white/80">{{ product.sku }}</td>
              <td class="px-4 py-4 text-center">
                <span
                  :class="[
                    'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase',
                    statusClass(product.stock_status)
                  ]"
                >
                  <Circle
                    :size="8"
                    :class="[
                      product.stock_status === 'in_stock'
                        ? 'text-emerald-300'
                        : product.stock_status === 'low_stock'
                        ? 'text-amber-300'
                        : 'text-rose-300'
                    ]"
                    fill="currentColor"
                  />
                  {{ statusText(product.stock_status) }}
                </span>
              </td>
              <td class="px-4 py-4 text-right font-semibold text-white">{{ formatCurrency(product.price) }}</td>
              <td class="rounded-r-2xl px-4 py-4 text-right text-xs text-white/50">
                {{ product.last_synced_at ? formatDate(product.last_synced_at) : 'Senkr. bekliyor' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Circle, Download, RefreshCw } from 'lucide-vue-next'
import { useProducts } from '../stores/products'
import { downloadCSV, toCSV } from '../composables/useCsv'

const productsStore = useProducts()

async function syncProducts() {
  await productsStore.syncFromShopier()
}

function exportProducts() {
  const rows = productsStore.items.map(product => ({
    id: product.id,
    baslik: product.title,
    kategori: product.category,
    sku: product.sku,
    durum: statusText(product.stock_status),
    fiyat: product.price,
    son_senkron: product.last_synced_at ? product.last_synced_at.toISOString() : ''
  }))

  downloadCSV(
    `urunler_${new Date().toISOString().slice(0, 10)}.csv`,
    toCSV(rows, ['id', 'baslik', 'kategori', 'sku', 'durum', 'fiyat', 'son_senkron'])
  )
}

function statusText(status: 'in_stock' | 'low_stock' | 'out_of_stock') {
  switch (status) {
    case 'in_stock':
      return 'Stokta'
    case 'low_stock':
      return 'Az Stok'
    case 'out_of_stock':
      return 'Tukendi'
  }
}

function statusClass(status: 'in_stock' | 'low_stock' | 'out_of_stock') {
  switch (status) {
    case 'in_stock':
      return 'border-emerald-300/50 bg-emerald-500/15 text-emerald-100'
    case 'low_stock':
      return 'border-amber-300/50 bg-amber-500/15 text-amber-100'
    case 'out_of_stock':
      return 'border-rose-300/50 bg-rose-500/15 text-rose-100'
  }
}

const currencyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 0
})

function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

const lastSyncText = computed(() => {
  const syncedItems = productsStore.items.filter(item => item.last_synced_at)
  if (!syncedItems.length) return 'Henuz senkron edilmedi'
  const latest = syncedItems
    .map(item => item.last_synced_at as Date)
    .reduce((latest, current) => (current > latest ? current : latest), syncedItems[0].last_synced_at as Date)

  return formatDate(latest)
})
</script>
