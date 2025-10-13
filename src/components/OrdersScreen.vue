<template>
  <div class="space-y-6">
    <section class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm shadow-black/20">
        <span class="text-xs uppercase tracking-[0.35em] text-white/40">Toplam Sipariş</span>
        <div class="mt-3 flex items-end justify-between">
          <span class="text-3xl font-semibold text-white">{{ totalOrders }}</span>
          <span class="text-xs text-white/40">adet</span>
        </div>
      </div>
      <div class="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm shadow-black/20">
        <span class="text-xs uppercase tracking-[0.35em] text-white/40">Yaklaşan Termin (3 Gün)</span>
        <div class="mt-3 flex items-end justify-between">
          <span class="text-3xl font-semibold text-white">{{ dueSoonCount }}</span>
          <span class="text-xs text-white/40">adet</span>
        </div>
      </div>
      <div
        class="rounded-2xl border border-white/10 bg-gradient-to-br from-rose-500/10 via-white/5 to-rose-500/5 p-4 shadow-sm shadow-rose-500/20"
      >
        <span class="text-xs uppercase tracking-[0.35em] text-white/50">Gecikmede</span>
        <div class="mt-3 flex items-end justify-between">
          <span class="text-3xl font-semibold text-rose-100">{{ overdueCount }}</span>
          <span class="text-xs text-rose-200/70">adet</span>
        </div>
      </div>
      <div class="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm shadow-black/20">
        <span class="text-xs uppercase tracking-[0.35em] text-white/40">Ortalama Tamamlanma</span>
        <div class="mt-3 flex items-end justify-between">
          <span class="text-3xl font-semibold text-white">{{ averageProgress }}%</span>
          <span class="text-xs text-white/40">ilerleme</span>
        </div>
      </div>
    </section>

    <section class="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/20">
      <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-center gap-3">
          <div class="rounded-xl bg-primary-500/20 p-2 text-primary-200">
            <Filter :size="18" />
          </div>
          <div>
            <h2 class="text-base font-semibold text-white">Filtreler</h2>
            <p class="text-xs text-white/50">Aşamaya göre süzün, gecikmeleri yakalayın.</p>
          </div>
        </div>
        <div class="flex flex-1 flex-wrap items-center gap-3">
          <div class="relative min-w-[200px] flex-1 sm:w-60">
            <select
              v-model="stageFilter"
              class="w-full appearance-none rounded-xl border border-white/15 bg-slate-950/40 px-4 py-2.5 pr-12 text-sm font-medium text-white/80 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/60"
            >
              <option value="all">Tüm Aşamalar</option>
              <option v-for="(s, i) in stages" :key="s" :value="i + 1">{{ i + 1 }}. {{ s }}</option>
            </select>
            <ChevronDown class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40" :size="18" />
          </div>
          <label
            class="flex items-center gap-3 rounded-xl border border-white/15 bg-slate-950/40 px-4 py-2.5 text-sm text-white/70 transition hover:border-primary-400/60"
          >
            <input
              v-model="delayOnly"
              type="checkbox"
              class="h-4 w-4 rounded border-white/20 bg-black/20 text-primary-400 accent-primary-400 focus:ring-2 focus:ring-primary-400/60 focus:ring-offset-0"
            />
            <span>Sadece Gecikmelileri Göster</span>
          </label>
          <button
            @click="exportRows"
            class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-primary-500/30 transition hover:from-primary-400 hover:to-emerald-300"
          >
            <Download :size="16" /> E-Tablo
          </button>
        </div>
      </div>
    </section>

    <div
      v-if="items.length === 0"
      class="rounded-2xl border border-dashed border-white/15 bg-white/5 p-10 text-center text-white/60"
    >
      <div class="text-lg font-semibold text-white">Henüz gösterilecek sipariş yok.</div>
      <p class="mt-2 text-sm text-white/50">Filtreleri değiştirerek farklı sonuçlar deneyebilirsiniz.</p>
    </div>

    <section
      v-else
      class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
    >
      <article
        v-for="o in items"
        :key="o.id"
        :class="[
          'group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-500/20',
          o.overdue ? 'border-rose-500/40 bg-rose-500/5' : ''
        ]"
      >
        <div class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div class="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-emerald-500/10"></div>
        </div>

        <div class="relative flex items-start justify-between">
          <div>
            <div class="text-xs uppercase tracking-[0.35em] text-white/40">Sipariş</div>
            <div class="text-xl font-semibold text-white">{{ o.id }}</div>
          </div>
          <span
            v-if="o.overdue"
            class="inline-flex items-center gap-1.5 rounded-full border border-rose-400/60 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-200"
          >
            <AlertTriangle :size="14" /> Gecikme
          </span>
        </div>

        <div class="mt-4 space-y-1 text-sm text-white/70">
          <div class="font-medium text-white">{{ o.customer_name }}</div>
          <div>Toplam: <span class="font-semibold text-white">{{ formatPrice(o.total_price) }}</span></div>
        </div>

        <div class="mt-4 space-y-2">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="text-xs uppercase tracking-[0.35em] text-white/40">Aşama {{ o.current_stage }}/7</span>
            <span class="text-sm font-medium text-white">{{ stages[o.current_stage - 1] }}</span>
          </div>
          <div class="h-2.5 overflow-hidden rounded-full bg-white/10">
            <div
              class="h-full rounded-full bg-gradient-to-r from-primary-500 via-emerald-400 to-primary-400 transition-all duration-500"
              :style="{ width: o.progressPct + '%' }"
            ></div>
          </div>
        </div>

        <div class="mt-5 grid grid-cols-2 gap-3 text-xs text-white/50">
          <div class="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <div class="text-[10px] uppercase tracking-[0.3em] text-white/30">Başlangıç</div>
            <div class="mt-1 font-medium text-white">{{ new Date(o.planned_start).toLocaleDateString('tr-TR') }}</div>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <div class="text-[10px] uppercase tracking-[0.3em] text-white/30">Termin</div>
            <div class="mt-1 font-medium text-white">{{ new Date(o.deadline).toLocaleDateString('tr-TR') }}</div>
          </div>
        </div>

        <div class="mt-5 flex">
          <a
            :href="waUrl(o)"
            target="_blank"
            rel="noreferrer"
            class="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-300/40 bg-emerald-400/20 px-4 py-2.5 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/30 hover:text-white"
          >
            <Phone :size="16" /> WhatsApp ile İletişim
          </a>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Filter, Download, AlertTriangle, Phone, ChevronDown } from 'lucide-vue-next'
import { useOrders } from '../stores/orders'
import { toCSV, downloadCSV } from '../composables/useCsv'

const stages = [
  'Planlama',
  'Ürün Hazırlık',
  'Doku / Çizim / Boyama',
  'Çerçeve Kesim & Montaj',
  'Paketleme',
  'Kargoya Teslim',
  'Teslim & Geri Bildirim'
]

const store = useOrders()
const stageFilter = ref<'all' | number>('all')
const delayOnly = ref(false)

const items = computed(() => {
  const now = Date.now()
  return store.items
    .map(o => ({
      ...o,
      overdue: new Date(o.deadline).getTime() < now && o.current_stage < 7,
      progressPct: Math.round((o.current_stage / 7) * 100)
    }))
    .filter(o => (stageFilter.value === 'all' ? true : o.current_stage === Number(stageFilter.value)))
    .filter(o => (delayOnly.value ? o.overdue : true))
})

const totalOrders = computed(() => store.items.length)
const overdueCount = computed(() => store.items.filter(o => new Date(o.deadline).getTime() < Date.now() && o.current_stage < 7).length)
const dueSoonCount = computed(() => {
  const now = Date.now()
  const threshold = 1000 * 60 * 60 * 24 * 3
  return store.items.filter(o => {
    const deadline = new Date(o.deadline).getTime()
    return o.current_stage < 7 && deadline >= now && deadline - now <= threshold
  }).length
})
const averageProgress = computed(() => {
  if (!store.items.length) return 0
  const totalPct = store.items.reduce((acc, o) => acc + (o.current_stage / 7) * 100, 0)
  return Math.round(totalPct / store.items.length)
})

const priceFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 0
})

function formatPrice(value: number) {
  return priceFormatter.format(value)
}

function waUrl(o: any) {
  const phone = (o.phone || '').replace(/\D/g, '')
  const txt = `${o.customer_name}, ${o.id} siparişiniz ${stages[o.current_stage - 1]} aşamasında. Bilgi için yazabilirsiniz - NAR Art Studio.`
  return `https://wa.me/${phone}?text=${encodeURIComponent(txt)}`
}

function exportRows() {
  const rows = items.value.map(o => ({
    order_id: o.id,
    customer: o.customer_name,
    stage: `${o.current_stage}/7`,
    total_price: o.total_price,
    deadline: new Date(o.deadline).toISOString(),
    overdue: o.overdue ? 'Evet' : 'Hayır'
  }))
  downloadCSV(
    `siparisler_${new Date().toISOString().slice(0, 10)}.csv`,
    toCSV(rows, ['order_id', 'customer', 'stage', 'total_price', 'deadline', 'overdue'])
  )
}
</script>
