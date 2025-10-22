<template>
  <div class="flex h-full flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800/60 bg-slate-900/60 px-5 py-4 shadow-lg">
      <div>
        <h2 class="text-lg font-semibold text-gray-100">Üretim Takvimi</h2>
        <p class="text-sm text-gray-400">Seçtiğiniz ayı 30 günlük bir şerit üzerinde takip edin, işlerin tarihlerini sürükleyip bırakarak güncelleyin.</p>
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

    <div class="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4 shadow-lg">
      <div class="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-gray-500">
        <span>{{ monthLabel }}</span>
        <span>30 gün görünümü</span>
      </div>
      <div class="relative overflow-hidden rounded-xl border border-slate-800/50 bg-slate-950/70">
        <svg ref="svgRef" class="h-[480px] w-full" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

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

const stageOptions = progressSteps.map((step, index) => ({ label: step.label, value: String(index) }))

const monthLabel = computed(() => {
  const month = monthOptions.find(option => option.value === selectedMonth.value)?.label ?? ''
  return `${month} ${selectedYear.value}`
})

const viewWindow = computed(() => {
  const month = Number(selectedMonth.value)
  const year = Number(selectedYear.value)
  const first = new Date(year, month, 1)
  const start = new Date(year, month, 1)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 29)
  end.setHours(23, 59, 59, 999)
  const label = new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(first)
  return { start, end, label }
})

const filteredTimeline = computed(() => {
  const window = viewWindow.value
  const stageSet = new Set(selectedStages.value)
  return timelineItems.filter(item => {
    if (!stageSet.has(String(item.progressIndex))) return false
    if (hideDelivered.value && item.delivered) return false
    return item.end >= windowRange.start && item.start <= windowRange.end
  })
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

const svgRef = ref<SVGSVGElement | null>(null)
const dragState = reactive({
  active: false,
  id: '',
  edge: '',
  mode: 'resize' as 'resize' | 'move',
  startX: 0,
  initialStart: 0,
  initialEnd: 0,
  pxPerDay: 30
})

watch([filteredTimeline, viewWindow], () => {
  drawChart()
})

onMounted(() => {
  drawChart()
})

onBeforeUnmount(() => {
  window.onmousemove = null
  window.onmouseup = null
})

function drawChart() {
  const svg = svgRef.value
  if (!svg) return
  const windowRange = viewWindow.value
  const totalMs = windowRange.end.getTime() - windowRange.start.getTime() || 1

  const width = svg.clientWidth || 1200
  const height = svg.clientHeight || 480
  svg.innerHTML = ''

  const barHeight = 34
  const rowHeight = 56
  const paddingLeft = 180
  const paddingTop = 72
  const axisHeight = 56
  const usableWidth = width - paddingLeft - 48
  dragState.pxPerDay = usableWidth / 30

  const highlightGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  highlightGroup.setAttribute('class', 'weekend-group')
  svg.appendChild(highlightGroup)

  const grid = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  grid.setAttribute('class', 'grid')
  svg.appendChild(grid)

  const axis = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  axis.setAttribute('class', 'axis')
  svg.appendChild(axis)

  const axisBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  axisBg.setAttribute('x', `${paddingLeft}`)
  axisBg.setAttribute('y', `${paddingTop - 48}`)
  axisBg.setAttribute('width', `${usableWidth}`)
  axisBg.setAttribute('height', `${48}`)
  axisBg.setAttribute('fill', 'rgba(15, 23, 42, 0.9)')
  axisBg.setAttribute('rx', '12')
  axis.appendChild(axisBg)

  const title = document.createElementNS('http://www.w3.org/2000/svg', 'text')
  title.setAttribute('x', `${paddingLeft + usableWidth / 2}`)
  title.setAttribute('y', `${axisHeight - 28}`)
  title.setAttribute('text-anchor', 'middle')
  title.setAttribute('fill', 'rgba(226, 232, 240, 0.75)')
  title.setAttribute('font-size', '16px')
  title.setAttribute('font-weight', '600')
  title.textContent = windowRange.label
  axis.appendChild(title)

  const weekdays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

  for (let day = 0; day < 30; day++) {
    const x = paddingLeft + (day / 30) * usableWidth
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('x1', `${x}`)
    line.setAttribute('x2', `${x}`)
    line.setAttribute('y1', `${paddingTop}`)
    line.setAttribute('y2', `${height}`)
    const labelDate = new Date(windowRange.start)
    labelDate.setDate(windowRange.start.getDate() + day)
    const weekend = labelDate.getDay() === 0 || labelDate.getDay() === 6
    if (day % 7 === 0) {
      line.setAttribute('stroke-width', '1.5')
    }
    line.setAttribute('stroke', weekend ? 'rgba(248, 113, 113, 0.12)' : 'rgba(148, 163, 184, 0.12)')
    grid.appendChild(line)

    if (weekend) {
      const highlight = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      highlight.setAttribute('x', `${paddingLeft + (day / 30) * usableWidth}`)
      highlight.setAttribute('y', `${paddingTop}`)
      highlight.setAttribute('width', `${usableWidth / 30}`)
      highlight.setAttribute('height', `${height - paddingTop}`)
      highlight.setAttribute('fill', 'rgba(248, 113, 113, 0.07)')
      highlightGroup.appendChild(highlight)
    }

    const dayLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    dayLabel.setAttribute('x', `${x}`)
    dayLabel.setAttribute('y', `${axisHeight}`)
    dayLabel.setAttribute('text-anchor', 'middle')
    dayLabel.setAttribute('fill', 'rgba(148, 163, 184, 0.75)')
    dayLabel.setAttribute('font-size', '11px')
    dayLabel.setAttribute('font-family', 'inherit')
    dayLabel.textContent = pad(labelDate.getDate())
    axis.appendChild(dayLabel)

    const weekdayLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    weekdayLabel.setAttribute('x', `${x}`)
    weekdayLabel.setAttribute('y', `${axisHeight + 16}`)
    weekdayLabel.setAttribute('text-anchor', 'middle')
    weekdayLabel.setAttribute('fill', weekend ? 'rgba(248, 113, 113, 0.7)' : 'rgba(148, 163, 184, 0.55)')
    weekdayLabel.setAttribute('font-size', '9px')
    weekdayLabel.textContent = weekdays[labelDate.getDay() === 0 ? 6 : labelDate.getDay() - 1]
    axis.appendChild(weekdayLabel)
  }

  const barsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  svg.appendChild(barsGroup)

  filteredTimeline.value.forEach((item, index) => {
    const startMs = Math.max(item.start.getTime(), windowRange.start.getTime())
    const endMs = Math.min(item.end.getTime(), windowRange.end.getTime())
    const offset = ((startMs - windowRange.start.getTime()) / totalMs) * usableWidth
    const barWidth = Math.max(16, ((endMs - startMs) / totalMs) * usableWidth)
    const y = paddingTop + index * rowHeight

    const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    background.setAttribute('x', `${paddingLeft}`)
    background.setAttribute('y', `${y - barHeight / 2}`)
    background.setAttribute('width', `${usableWidth}`)
    background.setAttribute('height', `${barHeight}`)
    background.setAttribute('rx', '10')
    background.setAttribute('fill', 'rgba(30, 41, 59, 0.55)')
    barsGroup.appendChild(background)

    const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    bar.setAttribute('x', `${paddingLeft + offset}`)
    bar.setAttribute('y', `${y - barHeight / 2}`)
    bar.setAttribute('width', `${barWidth}`)
    bar.setAttribute('height', `${barHeight}`)
    bar.setAttribute('rx', '10')
    bar.setAttribute('class', item.delivered ? 'bar delivered' : 'bar active')
    bar.dataset.id = item.id
    barsGroup.appendChild(bar)

    const barText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    barText.setAttribute('x', `${paddingLeft + offset + barWidth / 2}`)
    barText.setAttribute('y', `${y + 5}`)
    barText.setAttribute('text-anchor', 'middle')
    barText.setAttribute('fill', 'rgba(15, 23, 42, 0.85)')
    barText.setAttribute('font-size', '11px')
    barText.setAttribute('font-family', 'inherit')
    barText.setAttribute('font-weight', '600')
    barText.textContent = `${progressSteps[item.progressIndex].short}`
    barsGroup.appendChild(barText)

    const leftHandle = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    leftHandle.setAttribute('x', `${paddingLeft + offset - 6}`)
    leftHandle.setAttribute('y', `${y - barHeight / 2}`)
    leftHandle.setAttribute('width', '12')
    leftHandle.setAttribute('height', `${barHeight}`)
    leftHandle.setAttribute('rx', '6')
    leftHandle.setAttribute('class', 'handle')
    leftHandle.dataset.id = item.id
    leftHandle.dataset.edge = 'start'
    barsGroup.appendChild(leftHandle)

    const rightHandle = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rightHandle.setAttribute('x', `${paddingLeft + offset + barWidth - 6}`)
    rightHandle.setAttribute('y', `${y - barHeight / 2}`)
    rightHandle.setAttribute('width', '12')
    rightHandle.setAttribute('height', `${barHeight}`)
    rightHandle.setAttribute('rx', '6')
    rightHandle.setAttribute('class', 'handle')
    rightHandle.dataset.id = item.id
    rightHandle.dataset.edge = 'end'
    barsGroup.appendChild(rightHandle)

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    text.setAttribute('x', `${paddingLeft - 14}`)
    text.setAttribute('y', `${y - 6}`)
    text.setAttribute('text-anchor', 'end')
    text.setAttribute('fill', 'rgba(226, 232, 240, 0.9)')
    text.setAttribute('font-size', '13px')
    text.setAttribute('font-family', 'inherit')
    text.textContent = item.product_name
    barsGroup.appendChild(text)

    const customer = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    customer.setAttribute('x', `${paddingLeft - 14}`)
    customer.setAttribute('y', `${y + 12}`)
    customer.setAttribute('text-anchor', 'end')
    customer.setAttribute('fill', 'rgba(148, 163, 184, 0.6)')
    customer.setAttribute('font-size', '11px')
    customer.setAttribute('font-family', 'inherit')
    customer.textContent = item.customer_name
    barsGroup.appendChild(customer)
  })

  setupDrag(svg)
}

function setupDrag(svg: SVGSVGElement) {
  if (typeof window === 'undefined') return
  svg.onmousedown = event => {
    const target = event.target as SVGElement
    if (target?.classList.contains('handle')) {
      dragState.active = true
      dragState.mode = 'resize'
      dragState.id = target.dataset.id ?? ''
      dragState.edge = target.dataset.edge ?? ''
    } else if (target?.classList.contains('bar')) {
      dragState.active = true
      dragState.mode = 'move'
      dragState.id = (target as SVGRectElement).dataset.id ?? ''
      dragState.edge = ''
    } else {
      return
    }
    dragState.startX = event.clientX
    const item = timelineItems.find(order => order.id === dragState.id)
    dragState.initialStart = item ? item.start.getTime() : 0
    dragState.initialEnd = item ? item.end.getTime() : 0
  }

  window.onmousemove = event => {
    if (!dragState.active) return
    event.preventDefault()
  }

  window.onmouseup = event => {
    if (!dragState.active) return
    const delta = event.clientX - dragState.startX
    const deltaDays = Math.round(delta / dragState.pxPerDay)
    const item = timelineItems.find(order => order.id === dragState.id)
    if (item && deltaDays !== 0) {
      if (dragState.mode === 'move') {
        item.start = new Date(dragState.initialStart + deltaDays * 86400000)
        item.end = new Date(dragState.initialEnd + deltaDays * 86400000)
      } else if (dragState.edge === 'start') {
        item.start = new Date(dragState.initialStart + deltaDays * 86400000)
        if (item.start > item.end) item.start = new Date(item.end.getTime() - 86400000)
      } else if (dragState.edge === 'end') {
        item.end = new Date(dragState.initialEnd + deltaDays * 86400000)
        if (item.end < item.start) item.end = new Date(item.start.getTime() + 86400000)
      }
    }
    dragState.active = false
    dragState.id = ''
    dragState.edge = ''
    dragState.mode = 'resize'
    drawChart()
  }
}

function pad(value: number) {
  return value.toString().padStart(2, '0')
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('tr-TR').format(value)
}
</script>

<style scoped>
svg {
  width: 100%;
  height: 480px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.85), rgba(2, 6, 23, 0.65));
}

.weekend-group rect {
  pointer-events: none;
}

.grid line {
  stroke-width: 1;
}

.axis text {
  font-family: inherit;
}

.bar.active {
  fill: rgba(56, 189, 248, 0.35);
  stroke: rgba(56, 189, 248, 0.55);
  stroke-width: 1;
  cursor: grab;
}

.bar.delivered {
  fill: rgba(74, 222, 128, 0.3);
  stroke: rgba(74, 222, 128, 0.55);
  stroke-width: 1;
  cursor: grab;
}

.handle {
  fill: rgba(148, 163, 184, 0.25);
  cursor: ew-resize;
}

.handle:hover {
  fill: rgba(148, 163, 184, 0.45);
}
</style>
