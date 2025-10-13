<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div class="xl:col-span-1">
        <div class="rounded-2xl border border-white/10 bg-gradient-to-br from-primary-500/20 via-slate-950/60 to-emerald-400/20 p-6 shadow-xl shadow-primary-500/30">
          <div class="flex items-center gap-3">
            <div class="rounded-xl bg-slate-950/50 p-3 text-primary-100">
              <CircleDollarSign :size="24" />
            </div>
            <div>
              <h2 class="text-lg font-semibold text-white">Shopier Ödeme Özeti</h2>
              <p class="text-sm text-white/70">Son 7 günde kargoya çıkan siparişler</p>
            </div>
          </div>

          <div class="mt-6 space-y-4 text-sm">
            <div class="flex items-center justify-between rounded-xl border border-white/10 bg-white/10 px-4 py-3">
              <div class="text-white/60">Yaklaşan Çarşamba</div>
              <div class="text-base font-semibold text-white">{{ nextWedTR }} · 09:00</div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3">
                <div class="text-xs uppercase tracking-[0.3em] text-white/40">Bekleyen Kargo</div>
                <div class="mt-2 text-2xl font-semibold text-white">{{ waitingCount }}</div>
                <div class="text-xs text-white/40">adet</div>
              </div>
              <div class="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3">
                <div class="text-xs uppercase tracking-[0.3em] text-white/40">Teslim Edildi</div>
                <div class="mt-2 text-2xl font-semibold text-white">{{ deliveredCount }}</div>
                <div class="text-xs text-white/40">adet</div>
              </div>
            </div>
            <div class="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-5 text-center">
              <div class="text-sm text-white/60">Toplam Beklenen Tutar</div>
              <div class="mt-2 text-4xl font-bold text-white">{{ formatCurrency(toplamBeklenen) }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="xl:col-span-2">
        <div class="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 class="text-lg font-semibold text-white">Kargo & Ödeme Detayları</h2>
              <p class="text-sm text-white/50">Gönderi durumlarını ve ödeme süreçlerini takip edin.</p>
            </div>
            <button
              @click="exportRows"
              class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-primary-500/30 transition hover:from-primary-400 hover:to-emerald-300"
            >
              <Download :size="16" /> E-Tablo
            </button>
          </div>

          <div class="mt-5 space-y-3 overflow-y-auto pr-1 max-h-[calc(100vh-20rem)]">
            <div
              v-for="s in shipments.items"
              :key="s.order_id"
              :class="[
                'rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm shadow-black/10 transition hover:border-primary-400/40 hover:shadow-lg hover:shadow-primary-500/20',
                s.status === 'Teslim Edildi' ? 'border-emerald-400/40 bg-emerald-500/10' : ''
              ]"
            >
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div class="text-sm font-semibold text-white">{{ s.order_id }}</div>
                  <div class="text-xs uppercase tracking-[0.3em] text-white/40">Kargo Kodu: {{ s.cargo_code }}</div>
                </div>
                <span
                  :class="[
                    'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition',
                    s.status === 'Teslim Edildi'
                      ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-100'
                      : 'border-cyan-400/50 bg-cyan-400/15 text-cyan-100'
                  ]"
                >
                  {{ s.status }}
                </span>
              </div>

              <div class="mt-3 grid gap-3 text-sm text-white/70 md:grid-cols-2">
                <div class="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                  <div class="text-[10px] uppercase tracking-[0.3em] text-white/30">Ödeme Durumu</div>
                  <div class="mt-1 font-medium text-white">{{ s.payment_status }}</div>
                </div>
                <div class="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                  <div class="text-[10px] uppercase tracking-[0.3em] text-white/30">Kargoya Veriliş</div>
                  <div class="mt-1 font-medium text-white">{{ s.shipped_at ? new Date(s.shipped_at).toLocaleDateString('tr-TR') : '—' }}</div>
                </div>
              </div>

              <div class="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                <div class="text-white/50">
                  {{ s.delivered_at ? 'Teslim: ' + new Date(s.delivered_at).toLocaleDateString('tr-TR') : 'Teslim Bilgisi Bekleniyor' }}
                </div>
                <a
                  :href="`https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${encodeURIComponent(s.cargo_code)}`"
                  target="_blank"
                  rel="noreferrer"
                  class="inline-flex items-center gap-2 rounded-lg border border-primary-400/50 bg-primary-500/10 px-3 py-2 text-xs font-semibold text-primary-100 transition hover:bg-primary-500/20"
                >
                  Kargo Takip
                </a>
              </div>
            </div>
          </div>

          <div v-if="shipments.items.length === 0" class="mt-6 rounded-xl border border-dashed border-white/15 bg-white/5 p-8 text-center">
            <div class="text-base font-semibold text-white">Gösterilecek gönderi bulunamadı.</div>
            <p class="mt-2 text-sm text-white/50">Yeni gönderiler oluşturulduğunda burada belirecek.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CircleDollarSign, Download } from 'lucide-vue-next'
import { useOrders } from '../stores/orders'
import { useShipments } from '../stores/shipments'
import { nextWednesday, formatDateTR } from '../composables/useNextWednesday'
import { toCSV, downloadCSV } from '../composables/useCsv'

const orders = useOrders()
const shipments = useShipments()
const nextWed = nextWednesday()
const nextWedTR = formatDateTR(nextWed)

const shippedThisWindow = computed(() =>
  shipments.items.filter(
    s => s.shipped_at && Date.now() - new Date(s.shipped_at).getTime() < 7 * 24 * 3600 * 1000
  )
)
const toplamBeklenen = computed(() =>
  shippedThisWindow.value
    .filter(s => s.payment_status === 'Bekliyor')
    .map(s => orders.items.find(o => o.id === s.order_id)?.total_price || 0)
    .reduce((a, b) => a + b, 0)
)
const waitingCount = computed(() => shippedThisWindow.value.filter(s => s.payment_status === 'Bekliyor').length)
const deliveredCount = computed(() => shipments.items.filter(s => s.status === 'Teslim Edildi').length)

const currencyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 0
})

function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

function exportRows() {
  const rows = shipments.items.map(s => ({
    order_id: s.order_id,
    cargo_code: s.cargo_code,
    status: s.status,
    payment_status: s.payment_status,
    shipped_at: s.shipped_at ? new Date(s.shipped_at).toISOString() : '',
    delivered_at: s.delivered_at ? new Date(s.delivered_at).toISOString() : ''
  }))
  downloadCSV(
    `kargo_finans_${new Date().toISOString().slice(0, 10)}.csv`,
    toCSV(rows, ['order_id', 'cargo_code', 'status', 'payment_status', 'shipped_at', 'delivered_at'])
  )
}
</script>
