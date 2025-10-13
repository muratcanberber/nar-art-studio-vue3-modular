<template>
  <div class="space-y-6">
    <header class="glass-panel flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-lg font-semibold text-white">Siparis Ozeti</h2>
        <p class="text-sm text-white/60">
          Shopier ve diğer kanallardan gelen siparişleri tek listede takip edin.
        </p>
      </div>
      <div class="flex items-center gap-3 text-sm text-white/60">
        <span class="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2">
          Toplam: <span class="font-semibold text-white">{{ totalOrders }}</span>
        </span>
        <span class="inline-flex items-center gap-2 rounded-lg border border-rose-300/40 bg-rose-300/15 px-3 py-2 text-rose-100">
          Gecikmede: <span class="font-semibold">{{ overdueCount }}</span>
        </span>
      </div>
    </header>

    <section class="glass-panel space-y-4">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white/70">
          <Filter :size="16" class="text-white/40" />
          <span class="text-sm uppercase tracking-[0.3em] text-white/40">Filtreler</span>
        </div>

        <div class="flex flex-1 flex-wrap gap-3">
          <div class="relative min-w-[220px] sm:w-64">
            <select
              v-model="stageFilter"
              class="w-full appearance-none rounded-xl border border-white/15 bg-slate-950/40 px-4 py-2.5 pr-12 text-sm font-medium text-white/80 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/60"
            >
              <option value="all">Tum Asamalar</option>
              <option v-for="(s, index) in stages" :key="s" :value="index + 1">{{ index + 1 }}. {{ s }}</option>
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
            <span>Sadece gecikmeli siparişler</span>
          </label>
        </div>

        <button
          @click="exportRows"
          class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-primary-500/30 transition hover:from-primary-400 hover:to-emerald-300"
        >
          <Download :size="16" /> E-Tablo
        </button>
      </div>

      <div class="overflow-x-auto scroll-thin">
        <table class="table-shell min-w-[960px]">
          <thead class="text-xs uppercase tracking-[0.25em] text-white/40">
            <tr>
              <th class="rounded-l-xl bg-white/5 px-4 py-3">Sipariş</th>
              <th class="bg-white/5 px-4 py-3">Urun</th>
              <th class="bg-white/5 px-4 py-3">Cerceve</th>
              <th class="bg-white/5 px-4 py-3">Boyut</th>
              <th class="bg-white/5 px-4 py-3">Ozel Not</th>
              <th class="bg-white/5 px-4 py-3">Satıcı</th>
              <th class="bg-white/5 px-4 py-3">Sipariş Tarihi</th>
              <th class="bg-white/5 px-4 py-3">Kargoya Kalan</th>
              <th class="rounded-r-xl bg-white/5 px-4 py-3 text-right">Tutar</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="order in tableRows"
              :key="order.id"
              :class="[
                'group transition',
                order.overdue ? 'border border-rose-300/40 bg-rose-400/10 shadow-lg shadow-rose-500/20' : 'border border-white/10 bg-white/5',
                'rounded-2xl'
              ]"
            >
              <td class="rounded-l-2xl px-4 py-4 align-top">
                <div class="flex flex-col gap-2">
                  <span class="text-sm font-semibold text-white">{{ order.id }}</span>
                  <span
                    :class="[
                      'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium w-max',
                      order.overdue
                        ? 'border-rose-300/60 bg-rose-500/15 text-rose-100'
                        : 'border-primary-400/50 bg-primary-500/10 text-primary-100'
                    ]"
                  >
                    {{ order.stageLabel }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-4 align-top">
                <div class="flex gap-3">
                  <img
                    :src="order.product_image"
                    alt=""
                    class="h-14 w-14 rounded-xl object-cover ring-2 ring-white/10 transition group-hover:scale-105"
                  />
                  <div>
                    <div class="font-medium text-white">{{ order.product_name }}</div>
                    <div class="text-xs text-white/40">Musteri: {{ order.customer_name }}</div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4 align-top">
                <div class="font-medium text-white">{{ order.frame_color }}</div>
              </td>
              <td class="px-4 py-4 align-top">
                <div class="font-medium text-white">{{ order.size }}</div>
              </td>
              <td class="px-4 py-4 align-top max-w-[200px]">
                <p v-if="order.notes" class="text-sm leading-relaxed text-white/80">{{ order.notes }}</p>
                <span v-else class="text-xs text-white/40 italic">Not belirtilmemiş</span>
              </td>
              <td class="px-4 py-4 align-top">
                <div class="flex flex-col gap-1">
                  <span class="text-sm font-medium text-white">{{ order.vendor }}</span>
                  <a
                    :href="whatsappUrl(order)"
                    target="_blank"
                    rel="noreferrer"
                    class="inline-flex items-center gap-1 text-xs text-emerald-200 hover:text-emerald-100"
                  >
                    <Phone :size="14" /> WhatsApp
                  </a>
                </div>
              </td>
              <td class="px-4 py-4 align-top">
                <div class="text-white/80">{{ formatDate(order.created_at) }}</div>
              </td>
              <td class="px-4 py-4 align-top">
                <div class="flex flex-col gap-1">
                  <div
                    :class="[
                      'text-sm font-semibold',
                      order.overdue
                        ? 'text-rose-200'
                        : order.daysLeft <= 3
                        ? 'text-amber-200'
                        : 'text-emerald-200'
                    ]"
                  >
                    {{ order.timeLeftLabel }}
                  </div>
                  <div class="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      class="h-full rounded-full bg-gradient-to-r from-rose-400 via-amber-300 to-emerald-400 transition-all duration-500"
                      :style="{ width: order.progressPct + '%' }"
                    ></div>
                  </div>
                </div>
              </td>
              <td class="rounded-r-2xl px-4 py-4 text-right align-top font-semibold text-white">
                {{ formatCurrency(order.total_price) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="tableRows.length === 0" class="rounded-xl border border-dashed border-white/15 bg-white/5 p-8 text-center text-white/60">
        Filtreye uygun sipariş bulunamadı.
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Filter, Download, Phone, ChevronDown } from 'lucide-vue-next'
import { useOrders } from '../stores/orders'
import { toCSV, downloadCSV } from '../composables/useCsv'

const stages = [
  'Planlama',
  'Hazırlık',
  'Uretim',
  'Cerceve Montaj',
  'Paketleme',
  'Kargoya Teslim',
  'Teslim Tamamlandı'
]

const stageFilter = ref<'all' | number>('all')
const delayOnly = ref(false)
const ordersStore = useOrders()

const currencyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 0
})

const tableRows = computed(() => {
  const now = Date.now()
  return ordersStore.items
    .map(order => {
      const deadline = order.deadline.getTime()
      const diffMs = deadline - now
      const diffDaysRaw = diffMs / (1000 * 60 * 60 * 24)
      const daysLeft = Math.floor(diffDaysRaw)
      const capped = Math.min(15, Math.max(-15, Math.round(diffDaysRaw)))
      const overdue = diffMs < 0
      const progress = overdue ? 100 : Math.min(100, Math.max(0, ((15 - capped) / 15) * 100))

      let timeLeftLabel = ''
      if (overdue) {
        const overdueDays = Math.abs(Math.ceil(diffDaysRaw))
        timeLeftLabel = `-${overdueDays} gun`
      } else if (diffDaysRaw > 15) {
        timeLeftLabel = '15+ gun'
      } else if (diffDaysRaw >= 1) {
        timeLeftLabel = `${Math.ceil(diffDaysRaw)} gun`
      } else {
        const diffHours = Math.ceil(diffMs / (1000 * 60 * 60))
        timeLeftLabel = diffHours <= 0 ? 'Şimdi' : `${diffHours} saat`
      }

      return {
        ...order,
        stageLabel: stages[order.current_stage - 1] ?? 'TBD',
        overdue,
        daysLeft,
        timeLeftLabel,
        progressPct: progress
      }
    })
    .filter(order => (stageFilter.value === 'all' ? true : order.current_stage === Number(stageFilter.value)))
    .filter(order => (delayOnly.value ? order.overdue : true))
})

const totalOrders = computed(() => ordersStore.items.length)
const overdueCount = computed(() => tableRows.value.filter(o => o.overdue).length)

function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

function whatsappUrl(order: { phone: string; customer_name: string; id: string; stageLabel: string }) {
  const phone = (order.phone || '').replace(/\D/g, '')
  const text = `${order.customer_name}, ${order.id} siparisiniz ${order.stageLabel} asamasinda. Bilgi icin bize yazabilirsiniz - NAR Art Studio.`
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(value)
}

function exportRows() {
  const rows = tableRows.value.map(order => ({
    siparis_id: order.id,
    urun: order.product_name,
    cerceve: order.frame_color,
    boyut: order.size,
    not: order.notes ?? '',
    satici: order.vendor,
    siparis_tarihi: order.created_at.toISOString(),
    kargoya_kalan: order.timeLeftLabel,
    tutar: order.total_price
  }))

  downloadCSV(
    `siparisler_${new Date().toISOString().slice(0, 10)}.csv`,
    toCSV(rows, ['siparis_id', 'urun', 'cerceve', 'boyut', 'not', 'satici', 'siparis_tarihi', 'kargoya_kalan', 'tutar'])
  )
}
</script>
