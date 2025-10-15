<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800/60 bg-slate-900/60 px-5 py-4 shadow-lg">
      <div>
        <h2 class="text-lg font-semibold text-gray-100">Üretim Takvimi</h2>
        <p class="text-sm text-gray-400">
          Seçtiğiniz ayın haftalarını Pazartesi başlangıçlı hat üzerinde görün, işlerin tarihlerini sürükleyip bırakarak güncelleyin.
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <USelectMenu v-model="selectedMonth" :options="monthOptions" size="sm" class="w-40" />
        <USelectMenu v-model="selectedYear" :options="yearOptions" size="sm" class="w-32" />
        <USelectMenu
          v-model="selectedStages"
          :options="stageOptions"
          size="sm"
          class="w-48"
          multiple
          placeholder="Aşamalar"
        />
        <UCheckbox v-model="hideDelivered" label="Teslim edilenleri gizle" />
      </div>
    </div>

    <div class="grid gap-3 sm:grid-cols-3">
      <UCard v-for="stat in overviewStats" :key="stat.label" variant="soft" class="border-slate-800/70 py-3">
        <div class="flex items-center gap-3 text-sm text-gray-400">
          <UIcon :name="stat.icon" class="rounded-lg bg-slate-800/80 p-2 text-xl text-emerald-300" />
          <div class="flex flex-col">
            <span class="text-xs uppercase tracking-[0.2em] text-gray-500">{{ stat.label }}</span>
            <span class="text-lg font-semibold text-gray-100">{{ stat.value }}</span>
          </div>
        </div>
      </UCard>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4 shadow-lg">
      <div class="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-gray-500">
        <span>{{ monthLabel }}</span>
        <span>Pazartesi başlangıçlı 4 hafta</span>
      </div>
      <div ref="ganttRef" class="gantt-wrapper"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'

const isClient = import.meta.client

type OrderRow = {
  id: string
  product_name: string
  customer_name: string
  current_stage: number
  planned_start: string
  deadline: string
  created_at: string
}

type ShipmentRow = {
  order_id: string
  status: string
}

const { data: ordersData } = await useAsyncData<OrderRow[]>('timeline:orders', () => $fetch('/api/orders'))
const { data: shipmentsData } = await useAsyncData<ShipmentRow[]>('timeline:shipments', () => $fetch('/api/shipments'))

const progressSteps = [
  { label: 'Sipariş alındı', short: 'Alındı' },
  { label: 'Üretime başlandı', short: 'Üretim' },
  { label: 'Çerçeve tamamlandı', short: 'Çerçeve' },
  { label: 'Paketlendi', short: 'Paket' },
  { label: 'Kargoya verildi', short: 'Kargo' },
  { label: 'Teslim edildi', short: 'Teslim' }
] as const

const stageToProgressIndex: Record<number, number> = {
  1: 0,
  2: 1,
  3: 2,
  4: 2,
  5: 3,
  6: 4,
  7: 5
}

type TimelineItem = {
  id: string
  product_name: string
  customer_name: string
  current_stage: number
  start: Date
  end: Date
  shipment?: ShipmentRow | null
  progressIndex: number
  delivered: boolean
}

const timelineItems = reactive<TimelineItem[]>([])

watch([ordersData, shipmentsData], () => {
  timelineItems.splice(0)
  const shipmentsMap = new Map<string, ShipmentRow>()
  for (const shipment of shipmentsData.value ?? []) {
    shipmentsMap.set(shipment.order_id, shipment)
  }

  for (const order of ordersData.value ?? []) {
    const shipment = shipmentsMap.get(order.id) ?? null
    const progressIndex = stageToProgressIndex[order.current_stage] ?? 0
    const delivered = (shipment?.status ?? '').toLowerCase() === 'teslim edildi' || progressIndex === progressSteps.length - 1

    timelineItems.push({
      id: order.id,
      product_name: order.product_name,
      customer_name: order.customer_name,
      current_stage: order.current_stage,
      start: new Date(order.planned_start),
      end: new Date(order.deadline),
      shipment,
      progressIndex,
      delivered
    })
  }
}, { immediate: true })

const now = new Date()
const selectedMonth = ref(String(now.getMonth()))
const selectedYear = ref(String(now.getFullYear()))
const selectedStages = ref(progressSteps.map((_, idx) => String(idx)))
const hideDelivered = ref(true)

const monthOptions = [
  { label: 'Ocak', value: '0' },
  { label: 'Şubat', value: '1' },
  { label: 'Mart', value: '2' },
  { label: 'Nisan', value: '3' },
  { label: 'Mayıs', value: '4' },
  { label: 'Haziran', value: '5' },
  { label: 'Temmuz', value: '6' },
  { label: 'Ağustos', value: '7' },
  { label: 'Eylül', value: '8' },
  { label: 'Ekim', value: '9' },
  { label: 'Kasım', value: '10' },
  { label: 'Aralık', value: '11' }
]

const yearRange = Array.from({ length: 5 }, (_, idx) => now.getFullYear() - 2 + idx)
const yearOptions = yearRange.map(year => ({ label: String(year), value: String(year) }))

const stageOptions = progressSteps.map((step, index) => ({
  label: step.label,
  value: String(index)
}))

const monthLabel = computed(() => {
  const month = monthOptions.find(option => option.value === selectedMonth.value)?.label ?? ''
  return `${month} ${selectedYear.value}`
})

const viewWindow = computed(() => {
  const month = Number(selectedMonth.value)
  const year = Number(selectedYear.value)
  const firstOfMonth = new Date(year, month, 1)
  const offset = firstOfMonth.getDay() === 0 ? -6 : 1 - firstOfMonth.getDay()
  const start = new Date(firstOfMonth)
  start.setDate(firstOfMonth.getDate() + offset)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(start.getDate() + 27)
  end.setHours(23, 59, 59, 999)

  return { start, end }
})

const filteredTimeline = computed(() => {
  const window = viewWindow.value
  const stageSet = new Set(selectedStages.value)

  return timelineItems.filter(item => {
    if (!stageSet.has(String(item.progressIndex))) return false
    if (hideDelivered.value && item.delivered) return false
    return item.end >= window.start && item.start <= window.end
  })
})

const ganttTasks = computed(() => {
  const window = viewWindow.value
  return filteredTimeline.value.map(item => ({
    id: item.id,
    name: `${item.customer_name} • ${item.product_name}`,
    start: isoDate(Math.max(item.start.getTime(), window.start.getTime())),
    end: isoDate(Math.min(item.end.getTime(), window.end.getTime())),
    progress: Math.round(((item.progressIndex + 1) / progressSteps.length) * 100),
    custom_class: item.delivered ? 'gantt-delivered' : 'gantt-active'
  }))
})

const overviewStats = computed(() => {
  const total = filteredTimeline.value.length
  const inProgress = filteredTimeline.value.filter(item => !item.delivered).length
  const delivered = filteredTimeline.value.filter(item => item.delivered).length

  return [
    { label: 'Takvimdeki sipariş', value: formatNumber(total), icon: 'i-lucide-layout' },
    { label: 'Üretimde olan', value: formatNumber(inProgress), icon: 'i-lucide-gantt-chart' },
    { label: 'Teslim edilen', value: formatNumber(delivered), icon: 'i-lucide-badge-check' }
  ]
})

const ganttRef = ref<HTMLElement | null>(null)
let ganttInstance: any = null
let GanttClass: any = null

async function ensureGantt() {
  if (!isClient || GanttClass) return
  await import('frappe-gantt/dist/frappe-gantt.css')
  const mod = await import('frappe-gantt')
  GanttClass = mod.Gantt || mod.default
}

async function renderGantt() {
  if (!isClient || !ganttRef.value) return
  await ensureGantt()
  if (!GanttClass) return
  const tasks = ganttTasks.value

  if (ganttInstance) {
    ganttInstance.refresh(tasks)
    ganttInstance.change_view_mode('Day')
    return
  }

  ganttInstance = new GanttClass(ganttRef.value, tasks, {
    view_mode: 'Day',
    date_format: 'YYYY-MM-DD',
    on_date_change: (task: any, start: any, end: any) => handleDateChange(task, start, end),
    on_progress_change: (task: any, progress: number) => handleProgressChange(task, progress),
    custom_popup_html: (task: any) => {
      return `<div class="gantt-popup">
        <h3>${task.name}</h3>
        <p>${new Date(task.start).toLocaleDateString('tr-TR')} - ${new Date(task.end).toLocaleDateString('tr-TR')}</p>
        <p>İlerleme: ${task.progress}%</p>
      </div>`
    }
  })
}

function handleDateChange(task: any, start: string | Date, end: string | Date) {
  const target = timelineItems.find(item => item.id === task.id)
  if (!target) return
  target.start = new Date(start)
  target.end = new Date(end)
}

function handleProgressChange(task: any, progress: number) {
  const target = timelineItems.find(item => item.id === task.id)
  if (!target) return
  const index = Math.min(progressSteps.length - 1, Math.max(0, Math.round((progress / 100) * progressSteps.length) - 1))
  target.progressIndex = index
  target.delivered = index === progressSteps.length - 1
}

watch([ganttTasks, viewWindow], async () => {
  if (!isClient) return
  await nextTick()
  await renderGantt()
}, { immediate: true })

onMounted(async () => {
  if (!isClient) return
  await ensureGantt()
  await nextTick()
  await renderGantt()
})

function isoDate(ms: number) {
  return new Date(ms).toISOString().slice(0, 10)
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('tr-TR').format(value)
}
</script>

<style scoped>
.gantt-wrapper {
  min-height: 440px;
}

.gantt-wrapper :deep(.gantt-container) {
  background: transparent;
  color: rgba(226, 232, 240, 0.9);
  font-family: inherit;
}

.gantt-wrapper :deep(.bar.gantt-active) {
  fill: rgba(56, 189, 248, 0.35);
  stroke: rgba(56, 189, 248, 0.55);
}

.gantt-wrapper :deep(.bar.gantt-delivered) {
  fill: rgba(74, 222, 128, 0.3);
  stroke: rgba(74, 222, 128, 0.55);
}

.gantt-wrapper :deep(.bar-label) {
  fill: rgba(226, 232, 240, 0.95);
  font-size: 12px;
  font-weight: 600;
}

.gantt-wrapper :deep(.grid-row:nth-child(even)) {
  fill: rgba(15, 23, 42, 0.35);
}

.gantt-wrapper :deep(.grid-row) {
  stroke: rgba(148, 163, 184, 0.15);
}

.gantt-wrapper :deep(.grid-header) {
  fill: rgba(148, 163, 184, 0.4);
}

.gantt-wrapper :deep(.popup-wrapper) {
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  box-shadow: 0 20px 35px rgba(2, 6, 23, 0.55);
  color: rgba(226, 232, 240, 0.95);
}
</style>
