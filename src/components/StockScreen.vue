<template>
  <div class="space-y-6">
    <div class="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/20">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-lg font-semibold text-white">Stok Durumu</h2>
          <p class="text-sm text-white/50">Malzeme seviyelerini takip edin, kritik noktaları görün.</p>
        </div>
        <div class="flex flex-wrap items-center gap-3 text-sm text-white/70">
          <span class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1">
            Toplam Kalem: <span class="font-semibold text-white">{{ totalMaterials }}</span>
          </span>
          <span class="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-300/15 px-3 py-1 text-amber-100">
            Düşük Stok: <span class="font-semibold">{{ lowStockCount }}</span>
          </span>
          <button
            @click="exportRows"
            class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-emerald-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-primary-500/30 transition hover:from-primary-400 hover:to-emerald-300"
          >
            <Download :size="16" /> E-Tablo
          </button>
        </div>
      </div>
    </div>

    <section class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <article
        v-for="m in materials.items"
        :key="m.id"
        :class="[
          'relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-500/20',
          m.stock_qty < m.min_stock ? 'border-amber-400/50 bg-amber-500/10' : ''
        ]"
      >
        <div
          v-if="m.stock_qty < m.min_stock"
          class="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-amber-300/60 bg-amber-300/20 px-3 py-1 text-xs font-semibold text-amber-100"
        >
          Düşük Stok
        </div>
        <div class="text-xl font-semibold text-white">{{ m.name }}</div>

        <div class="mt-4 grid grid-cols-2 gap-3 text-sm text-white/70">
          <div class="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <div class="text-[10px] uppercase tracking-[0.3em] text-white/30">Mevcut</div>
            <div class="mt-1 text-lg font-semibold text-white">{{ m.stock_qty }}</div>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <div class="text-[10px] uppercase tracking-[0.3em] text-white/30">Min. Stok</div>
            <div class="mt-1 text-lg font-semibold text-white">{{ m.min_stock }}</div>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <div class="text-[10px] uppercase tracking-[0.3em] text-white/30">Bekleyen</div>
            <div class="mt-1 text-lg font-semibold text-white">{{ m.pending }}</div>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <div class="text-[10px] uppercase tracking-[0.3em] text-white/30">Kalan</div>
            <div class="mt-1 text-lg font-semibold text-white">{{ m.stock_qty - m.pending }}</div>
          </div>
          <div class="col-span-2">
            <div class="text-[10px] uppercase tracking-[0.3em] text-white/30">Doluluk</div>
            <div class="mt-2 h-2.5 overflow-hidden rounded-full bg-white/10">
              <div
                class="h-full rounded-full bg-gradient-to-r from-primary-500 via-emerald-400 to-primary-400 transition-all duration-500"
                :style="{ width: Math.min(100, Math.round((m.stock_qty / Math.max(1, m.min_stock)) * 100)) + '%' }"
              ></div>
            </div>
            <div class="mt-1 text-xs text-white/50">
              {{ Math.min(100, Math.round((m.stock_qty / Math.max(1, m.min_stock)) * 100)) }}% kapasite
            </div>
          </div>
        </div>

        <div class="mt-4 text-xs text-white/50">
          Konum: <span class="font-medium text-white">{{ m.location }}</span>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Download } from 'lucide-vue-next'
import { useMaterials } from '../stores/materials'
import { toCSV, downloadCSV } from '../composables/useCsv'

const materials = useMaterials()

const totalMaterials = computed(() => materials.items.length)
const lowStockCount = computed(() => materials.items.filter(m => m.stock_qty < m.min_stock).length)

function exportRows() {
  const rows = materials.items.map(m => ({
    name: m.name,
    stock: m.stock_qty,
    min: m.min_stock,
    pending: m.pending,
    location: m.location
  }))
  downloadCSV(`stok_${new Date().toISOString().slice(0, 10)}.csv`, toCSV(rows, ['name', 'stock', 'min', 'pending', 'location']))
}
</script>
