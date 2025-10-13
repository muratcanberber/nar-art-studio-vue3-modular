<template>
  <div class="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute -top-40 -left-32 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl"></div>
      <div class="absolute top-1/3 -right-40 h-[420px] w-[420px] rounded-full bg-emerald-400/10 blur-3xl"></div>
      <div class="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary-300/5 blur-3xl"></div>
    </div>

    <div class="relative flex min-h-screen">
      <aside
        :class="[
          'fixed md:static left-0 top-0 h-full w-72 bg-white/5 border-r border-white/10 px-6 py-8 flex flex-col gap-8 transition-transform duration-300 ease-out backdrop-blur-xl shadow-2xl shadow-black/30 z-30',
          navOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        ]"
      >
        <div class="space-y-3">
          <div class="text-xs uppercase tracking-[0.4em] text-white/50">NAR Art Studio</div>
          <div class="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary-200 via-white to-primary-300">
            Yonetim Paneli
          </div>
          <p class="text-sm leading-relaxed text-white/60">
            Siparis akisiniz, finans ve stok durumunu tek ekrandan izleyin.
          </p>
        </div>

        <nav class="flex-1 space-y-2">
          <button
            v-for="t in TABS"
            :key="t.key"
            @click="() => { tab = t.key; navOpen = false; }"
            :class="[
              'w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200 border border-transparent',
              tab === t.key
                ? 'bg-gradient-to-r from-primary-500 via-emerald-400 to-primary-400 text-slate-900 font-semibold shadow-lg shadow-primary-500/30'
                : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white hover:border-white/10 backdrop-blur'
            ]"
          >
            <div
              :class="[
                'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                tab === t.key ? 'bg-white/40 text-slate-900' : 'bg-white/10 text-primary-200'
              ]"
            >
              <component :is="t.icon" :size="18" />
            </div>
            <div class="flex flex-col">
              <span>{{ t.label }}</span>
              <span v-if="t.description" class="text-xs text-white/40">
                {{ t.description }}
              </span>
            </div>
          </button>
        </nav>

        <div class="mt-auto rounded-2xl border border-white/10 bg-white/5 p-5 text-sm shadow-inner shadow-black/20">
          <div class="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200">Hizli Bilgi</div>
          <div class="mt-3 leading-relaxed text-white/70">
            Sonraki Shopier Odemesi:
            <br />
            <span class="text-base font-semibold text-white">{{ formatDateTR(nextWed) }} - 09:00</span>
          </div>
          <div class="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white/50">
            <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"></span>
            Guncel Saat - {{ nowText }}
          </div>
        </div>
      </aside>

      <div class="flex flex-1 flex-col">
        <header class="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-slate-950/80 px-6 py-4 backdrop-blur-xl">
          <div class="flex items-center gap-3">
            <button
              @click="navOpen = !navOpen"
              class="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/10 p-3 text-white/80 transition hover:bg-white/20 md:hidden"
            >
              <component :is="navOpen ? icons.X : icons.Menu" :size="20" />
            </button>
            <div class="hidden flex-col md:flex">
              <span class="text-xs uppercase tracking-[0.35em] text-white/40">Aktif Sekme</span>
              <span class="text-lg font-semibold text-white">{{ currentTab.label }}</span>
            </div>
          </div>
          <div class="ml-auto flex items-center gap-3 text-sm text-white/60">
            <div class="hidden flex-col text-right sm:flex">
              <span class="text-xs uppercase tracking-[0.35em] text-white/40">Bugun</span>
              <span class="font-medium text-white">{{ todayText }}</span>
            </div>
            <div class="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-medium text-white/80">
              {{ nowText }}
            </div>
          </div>
        </header>

        <main class="flex-1 px-4 py-6 sm:px-6 lg:px-10">
          <div class="mx-auto w-full max-w-7xl space-y-6">
            <OrdersScreen v-if="tab==='orders'" />
            <ProductionTimeline v-else-if="tab==='timeline'" />
            <FinanceScreen v-else-if="tab==='finance'" />
            <StockScreen v-else-if="tab==='stock'" />
            <CostScreen v-else-if="tab==='cost'" />
            <ProductsScreen v-else />
          </div>
        </main>
      </div>
    </div>

    <div class="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-slate-950/90 px-3 py-2 backdrop-blur-xl md:hidden">
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="t in TABS"
          :key="t.key"
          @click="tab=t.key"
          :class="[
            'flex flex-col items-center gap-1 rounded-xl py-2 text-xs font-semibold transition-all',
            tab===t.key
              ? 'bg-gradient-to-r from-primary-500 to-emerald-400 text-slate-900 shadow-lg shadow-primary-500/40'
              : 'bg-white/5 text-white/70 hover:bg-white/10'
          ]"
        >
          <component :is="t.icon" :size="18" />
          <span>{{ t.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { Package, Truck, Warehouse, BarChart3, Menu, X, CalendarCheck2, Layers } from 'lucide-vue-next'
import OrdersScreen from './components/OrdersScreen.vue'
import ProductionTimeline from './components/ProductionTimeline.vue'
import FinanceScreen from './components/FinanceScreen.vue'
import StockScreen from './components/StockScreen.vue'
import CostScreen from './components/CostScreen.vue'
import ProductsScreen from './components/ProductsScreen.vue'
import { nextWednesday, formatDateTR } from './composables/useNextWednesday'

const navOpen = ref(false)
const tab = ref<'orders'|'timeline'|'finance'|'stock'|'cost'|'products'>('orders')
const nextWed = ref(nextWednesday())

const TABS = [
  { key: 'orders', label: 'Siparisler', icon: Package, description: 'Siparis akisini yonet' },
  { key: 'timeline', label: 'Yapim Sureci', icon: CalendarCheck2, description: 'Gantt takvimi ile izle' },
  { key: 'finance', label: 'Kargo & Finans', icon: Truck, description: 'Odeme ve gonderileri izle' },
  { key: 'stock', label: 'Stok', icon: Warehouse, description: 'Malzemeleri kontrol et' },
  { key: 'cost', label: 'Maliyet', icon: BarChart3, description: 'Gelir ve gider analizleri' },
  { key: 'products', label: 'Urunler', icon: Layers, description: 'Shopier urun envanteri' }
] as const

const currentTab = computed(() => TABS.find(t => t.key === tab.value) ?? TABS[0])

const icons = { Menu, X }

const todayText = new Intl.DateTimeFormat('tr-TR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long'
}).format(new Date())

const nowText = ref(getClock())
let timer: number | undefined

onMounted(() => {
  timer = window.setInterval(() => {
    nowText.value = getClock()
  }, 30_000)
})

onBeforeUnmount(() => {
  if (timer) {
    window.clearInterval(timer)
  }
})

function getClock() {
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date())
}
</script>
