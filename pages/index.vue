<template>
  <NuxtLayout name="dashboard">
    <template #sidebar>
      <div class="hidden w-full flex-1 flex-col items-center justify-between py-4 lg:flex">
        <div class="flex flex-col items-center gap-4">
          <UTooltip v-for="(item, index) in tabItems" :key="item.key" :text="item.label" placement="right">
            <UButton
              variant="ghost"
              color="gray"
              size="lg"
              class="flex h-12 w-12 items-center justify-center rounded-xl transition-colors"
              :class="tabIndex === index ? 'bg-slate-800 text-emerald-300' : 'text-gray-400 hover:bg-slate-800/70 hover:text-slate-100'"
              :aria-pressed="tabIndex === index"
              @click="onTabChange(index)"
            >
              <UIcon :name="item.icon" class="text-xl" />
            </UButton>
          </UTooltip>
        </div>
        <div class="flex flex-col items-center gap-3 text-xs text-gray-400">
          <span>{{ todayText }}</span>
          <span class="font-semibold text-emerald-300">{{ nowText }}</span>
        </div>
      </div>
    </template>

    <template #topbar>
      <div class="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-8">
        <div class="flex items-center gap-3">
          <span class="text-xs uppercase tracking-[0.5em] text-gray-500">Nar Art Studio</span>
          <span class="text-sm font-semibold text-gray-200">Yönetim Paneli</span>
        </div>
        <div class="flex items-center gap-4 text-xs text-gray-400">
          <span>Sonraki Shopier Ödemesi:</span>
          <span class="font-medium text-emerald-300">{{ nextPaymentText }} - 09:00</span>
        </div>
      </div>
    </template>

    <div class="panel-shell">
      <component :is="currentTab.component" />
    </div>

    <template #mobile-nav>
      <UTabs v-model="tabIndex" :items="tabItems" :content="false" orientation="horizontal" @change="onTabChange">
        <template #default="{ item, selected }">
          <div class="flex flex-col items-center gap-1">
            <UIcon :name="item.icon" :class="selected ? 'text-emerald-300' : 'text-gray-400'" />
            <span class="text-xs font-medium text-gray-100">{{ item.label }}</span>
            <UBadge
              v-if="navBadges[item.key]"
              :label="navBadges[item.key]"
              variant="subtle"
              color="gray"
              class="text-[10px] text-emerald-300"
            />
          </div>
        </template>
      </UTabs>
    </template>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import { nextWednesday, formatDateTR } from '~/composables/useNextWednesday'

const nextPaymentText = formatDateTR(nextWednesday())

const todayText = new Intl.DateTimeFormat('tr-TR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long'
}).format(new Date())

const clockFormatter = new Intl.DateTimeFormat('tr-TR', {
  hour: '2-digit',
  minute: '2-digit'
})

const nowText = ref(clockFormatter.format(new Date()))
let timer: number | undefined

type TabItem = {
  key: 'orders' | 'timeline' | 'finance' | 'stock' | 'cost' | 'products'
  label: string
  description: string
  icon: string
  component: Component
}

const tabItems = [
  {
    key: 'orders',
    label: 'Siparişler',
    description: 'Sipariş akışını yönet',
    icon: 'i-lucide-package',
    component: defineAsyncComponent(() => import('~/components/OrdersScreen.vue'))
  },
  {
    key: 'timeline',
    label: 'Üretim Takvimi',
    description: 'Planı takip edin',
    icon: 'i-lucide-calendar-check-2',
    component: defineAsyncComponent(() => import('~/components/ProductionTimeline.vue'))
  },
  {
    key: 'finance',
    label: 'Kargo & Finans',
    description: 'Ödemeleri izleyin',
    icon: 'i-lucide-truck',
    component: defineAsyncComponent(() => import('~/components/FinanceScreen.vue'))
  },
  {
    key: 'stock',
    label: 'Stok',
    description: 'Malzemeleri kontrol edin',
    icon: 'i-lucide-warehouse',
    component: defineAsyncComponent(() => import('~/components/StockScreen.vue'))
  },
  {
    key: 'cost',
    label: 'Maliyet',
    description: 'Gelir gider analizleri',
    icon: 'i-lucide-bar-chart-3',
    component: defineAsyncComponent(() => import('~/components/CostScreen.vue'))
  },
  {
    key: 'products',
    label: 'Ürünler',
    description: 'Mağaza kataloğu',
    icon: 'i-lucide-layers',
    component: defineAsyncComponent(() => import('~/components/ProductsScreen.vue'))
  }
] satisfies TabItem[]

const { data: ordersData } = await useAsyncData('orders:index', () => $fetch('/api/orders'))
const { data: shipmentsData } = await useAsyncData('shipments:index', () => $fetch('/api/shipments'))
const { data: materialsData } = await useAsyncData('materials:index', () => $fetch('/api/materials'))
const { data: productsData } = await useAsyncData('products:index', () => $fetch('/api/products'))
const { data: costsData } = await useAsyncData('costs:index', () => $fetch('/api/costs'))

const ordersList = computed(() => ordersData.value ?? [])
const shipmentsList = computed(() => shipmentsData.value ?? [])
const materialsList = computed(() => materialsData.value ?? [])
const productsList = computed(() => productsData.value ?? [])
const costsList = computed(() => costsData.value ?? [])

const totalOrders = computed(() => ordersList.value.length)
const totalRevenue = computed(() => ordersList.value.reduce((sum, order) => sum + (order.total_price ?? 0), 0))
const waitingPayments = computed(
  () => shipmentsList.value.filter(shipment => shipment.payment_status === 'Bekliyor').length
)
const activeProduction = computed(
  () => ordersList.value.filter(order => Number(order.current_stage ?? 0) <= 4).length
)
const lowStockCount = computed(
  () => materialsList.value.filter(item => item.in_stock <= item.threshold).length
)
const productsCount = computed(() => productsList.value.length)
const overBudgetCount = computed(
  () => costsList.value.filter(item => item.actual > item.planned).length
)

const tabIndex = ref(0)

const currentTab = computed(() => tabItems[tabIndex.value] ?? tabItems[0])

const navBadges = computed<Record<TabItem['key'], string>>(() => ({
  orders: totalOrders.value ? formatNumber(totalOrders.value) : '',
  timeline: activeProduction.value ? formatNumber(activeProduction.value) : '',
  finance: waitingPayments.value ? formatNumber(waitingPayments.value) : '',
  stock: lowStockCount.value ? formatNumber(lowStockCount.value) : '',
  cost: overBudgetCount.value ? formatNumber(overBudgetCount.value) : '',
  products: productsCount.value ? formatNumber(productsCount.value) : ''
}))

function formatNumber(value: number) {
  return new Intl.NumberFormat('tr-TR').format(value)
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0
  }).format(value)
}

function onTabChange(index: number) {
  tabIndex.value = index
}

onMounted(() => {
  timer = window.setInterval(() => {
    nowText.value = clockFormatter.format(new Date())
  }, 30_000)
})

onBeforeUnmount(() => {
  if (timer) {
    window.clearInterval(timer)
  }
})
</script>

<style scoped>
.panel-shell {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.panel-fade-enter-active,
.panel-fade-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
  transform-origin: center;
}

.panel-fade-enter-from,
.panel-fade-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}
</style>
