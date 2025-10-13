<template>
  <div class="space-y-6">
    <section class="glass-panel flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-lg font-semibold text-white">Stok Durumu</h2>
        <p class="text-sm text-white/60">
          Kategorilere gore malzeme seviyelerini goruntuleyin, yeni stok kalemleri ekleyin ve miktarlari guncelleyin.
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/40">
        <span>Toplam Kategori: <strong class="text-white/80">{{ categoryCount }}</strong></span>
        <span>Toplam Malzeme: <strong class="text-white/80">{{ itemCount }}</strong></span>
        <span class="inline-flex items-center gap-2 rounded-full border border-rose-300/40 bg-rose-400/20 px-3 py-1 text-rose-100">
          Stok Alarmi: <strong>{{ criticalCount }}</strong>
        </span>
        <button
          @click="exportAll"
          class="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white transition hover:border-primary-400/60 hover:text-primary-100"
        >
          CSV Disari Aktar
        </button>
      </div>
    </section>

    <section class="glass-panel grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <form @submit.prevent="handleAddProduct" class="space-y-4">
        <header>
          <h3 class="text-base font-semibold text-white">Yeni Urun Ekle</h3>
          <p class="text-xs text-white/50">Kategori secip stok detaylarini girerek yeni malzeme olusturun.</p>
        </header>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label class="flex flex-col gap-1 text-sm text-white/60">
            Kategori
            <select
              v-model="newProduct.categoryId"
              class="rounded-lg border border-white/15 bg-slate-950/50 px-3 py-2 text-sm text-white/80 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/60"
              required
            >
              <option disabled value="">Kategori secin</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </label>
          <label class="flex flex-col gap-1 text-sm text-white/60">
            Urun Adi
            <input
              v-model="newProduct.name"
              type="text"
              required
              class="rounded-lg border border-white/15 bg-slate-950/50 px-3 py-2 text-sm text-white/80 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/60"
            />
          </label>
          <label class="flex flex-col gap-1 text-sm text-white/60">
            Stok
            <input
              v-model.number="newProduct.stock_qty"
              type="number"
              min="0"
              required
              class="rounded-lg border border-white/15 bg-slate-950/50 px-3 py-2 text-sm text-white/80 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/60"
            />
          </label>
          <label class="flex flex-col gap-1 text-sm text-white/60">
            Minimum Stok
            <input
              v-model.number="newProduct.min_stock"
              type="number"
              min="0"
              required
              class="rounded-lg border border-white/15 bg-slate-950/50 px-3 py-2 text-sm text-white/80 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/60"
            />
          </label>
          <label class="flex flex-col gap-1 text-sm text-white/60">
            Bekleyen
            <input
              v-model.number="newProduct.pending"
              type="number"
              min="0"
              class="rounded-lg border border-white/15 bg-slate-950/50 px-3 py-2 text-sm text-white/80 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/60"
            />
          </label>
          <label class="flex flex-col gap-1 text-sm text-white/60">
            Konum
            <input
              v-model="newProduct.location"
              type="text"
              class="rounded-lg border border-white/15 bg-slate-950/50 px-3 py-2 text-sm text-white/80 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/60"
            />
          </label>
          <label class="flex flex-col gap-1 text-sm text-white/60">
            Birim Maliyet (TL)
            <input
              v-model.number="newProduct.unit_cost"
              type="number"
              min="0"
              step="0.01"
              required
              class="rounded-lg border border-white/15 bg-slate-950/50 px-3 py-2 text-sm text-white/80 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/60"
            />
          </label>
        </div>
        <button
          type="submit"
          class="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-emerald-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-primary-500/30 transition hover:from-primary-400 hover:to-emerald-300"
        >
          Urunu Kaydet
        </button>
        <p v-if="formFeedback" class="text-xs text-emerald-200">{{ formFeedback }}</p>
      </form>

      <form @submit.prevent="handleAddCategory" class="space-y-4 border-t border-white/10 pt-4 lg:border-t-0 lg:pt-0">
        <header>
          <h3 class="text-base font-semibold text-white">Yeni Kategori Olustur</h3>
          <p class="text-xs text-white/50">Kategori ekleyerek stok kalemlerini gruplandirin.</p>
        </header>
        <label class="flex flex-col gap-1 text-sm text-white/60">
          Kategori Adi
          <input
            v-model="categoryForm.name"
            type="text"
            required
            class="rounded-lg border border-white/15 bg-slate-950/50 px-3 py-2 text-sm text-white/80 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/60"
          />
        </label>
        <label class="flex flex-col gap-1 text-sm text-white/60">
          Aciklama (opsiyonel)
          <textarea
            v-model="categoryForm.description"
            rows="3"
            class="rounded-lg border border-white/15 bg-slate-950/50 px-3 py-2 text-sm text-white/80 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/60"
          ></textarea>
        </label>
        <button
          type="submit"
          class="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-primary-400/60 hover:text-primary-100"
        >
          Kategori Ekle
        </button>
        <p v-if="categoryFeedback" class="text-xs text-emerald-200">{{ categoryFeedback }}</p>
      </form>
    </section>

    <section class="glass-panel overflow-hidden">
      <div class="overflow-x-auto scroll-thin">
        <table class="table-shell min-w-[960px]">
          <thead class="text-xs uppercase tracking-[0.25em] text-white/40">
            <tr>
              <th class="rounded-l-xl bg-white/5 px-4 py-3">Kategori</th>
              <th class="bg-white/5 px-4 py-3">Urun</th>
              <th class="bg-white/5 px-4 py-3 text-center">Stok</th>
              <th class="bg-white/5 px-4 py-3 text-center">Min. Stok</th>
              <th class="bg-white/5 px-4 py-3 text-center">Bekleyen</th>
              <th class="bg-white/5 px-4 py-3 text-center">Kalan</th>
              <th class="bg-white/5 px-4 py-3 text-center">Birim Maliyet</th>
              <th class="bg-white/5 px-4 py-3">Konum</th>
              <th class="rounded-r-xl bg-white/5 px-4 py-3 text-right">Guncelle</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="category in categories" :key="category.id">
              <tr>
                <td colspan="9" class="px-4 pb-2 pt-6 text-xs uppercase tracking-[0.3em] text-white/35">
                  {{ category.name }}
                </td>
              </tr>
              <tr
                v-for="item in category.items"
                :key="item.id"
                :class="[
                  'rounded-2xl border bg-white/5 align-middle transition',
                  item.stock_qty <= 2 ? 'border-rose-300/50 bg-rose-500/10' : 'border-white/10'
                ]"
              >
                <td class="rounded-l-2xl px-4 py-4 align-top text-white/80">{{ category.name }}</td>
                <td class="px-4 py-4 align-top">
                  <div class="flex flex-col gap-1 text-white">
                    <span class="font-medium">{{ item.name }}</span>
                    <span v-if="item.stock_qty <= 2" class="text-xs font-semibold text-rose-200">Stok Alarmi</span>
                  </div>
                </td>
                <td class="px-4 py-4 text-center align-top font-semibold text-white">
                  <input
                    :value="item.stock_qty"
                    type="number"
                    min="0"
                    class="w-20 rounded-lg border border-white/15 bg-slate-950/60 px-2 py-1 text-center text-sm text-white focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/60"
                    @change="event => handleQuantityChange(category.id, item.id, event)"
                  />
                </td>
                <td class="px-4 py-4 text-center align-top text-white/80">{{ item.min_stock }}</td>
                <td class="px-4 py-4 text-center align-top text-white/80">{{ item.pending }}</td>
                <td class="px-4 py-4 text-center align-top text-white/80">{{ item.stock_qty - item.pending }}</td>
                <td class="px-4 py-4 text-center align-top text-white/80">{{ formatCurrency(item.unit_cost) }}</td>
                <td class="px-4 py-4 align-top text-white/80">{{ item.location }}</td>
                <td class="rounded-r-2xl px-4 py-4 text-right align-top">
                  <div class="inline-flex items-center gap-2">
                    <button
                      @click="materialsStore.adjustQuantity(category.id, item.id, 1)"
                      class="rounded-lg border border-white/10 bg-white/10 px-3 py-1 text-xs text-white transition hover:border-primary-400/60 hover:text-primary-100"
                    >
                      +1
                    </button>
                    <button
                      @click="materialsStore.adjustQuantity(category.id, item.id, -1)"
                      class="rounded-lg border border-white/10 bg-white/10 px-3 py-1 text-xs text-white transition hover:border-rose-400/60 hover:text-rose-200"
                    >
                      -1
                    </button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useMaterials } from '../stores/materials'
import { downloadCSV, toCSV } from '../composables/useCsv'

const materialsStore = useMaterials()

const categories = computed(() => materialsStore.categories)
const categoryCount = computed(() => materialsStore.categories.length)
const itemCount = computed(() => materialsStore.flatItems.length)
const criticalCount = computed(() => materialsStore.flatItems.filter(item => item.stock_qty <= 2).length)

const categoryForm = reactive({
  name: '',
  description: ''
})

const categoryFeedback = ref('')

const newProduct = reactive({
  categoryId: '',
  name: '',
  stock_qty: 0,
  min_stock: 0,
  pending: 0,
  location: '',
  unit_cost: 0
})

const formFeedback = ref('')

function handleAddCategory() {
  if (!categoryForm.name.trim()) return
  materialsStore.addCategory(categoryForm.name.trim(), categoryForm.description.trim() || undefined)
  categoryFeedback.value = `${categoryForm.name} kategorisi eklendi.`
  categoryForm.name = ''
  categoryForm.description = ''
  setTimeout(() => (categoryFeedback.value = ''), 2500)
}

function handleAddProduct() {
  if (!newProduct.categoryId || !newProduct.name.trim()) return
  materialsStore.addItem(newProduct.categoryId, {
    id: `${newProduct.categoryId}-${newProduct.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    name: newProduct.name.trim(),
    stock_qty: Number(newProduct.stock_qty),
    min_stock: Number(newProduct.min_stock),
    pending: Number(newProduct.pending),
    location: newProduct.location.trim() || 'Depo',
    unit_cost: Number(newProduct.unit_cost)
  })
  formFeedback.value = `${newProduct.name} stoklara eklendi.`
  newProduct.categoryId = ''
  newProduct.name = ''
  newProduct.stock_qty = 0
  newProduct.min_stock = 0
  newProduct.pending = 0
  newProduct.location = ''
  newProduct.unit_cost = 0
  setTimeout(() => (formFeedback.value = ''), 2500)
}

function handleQuantityChange(categoryId: string, itemId: string, event: Event) {
  const target = event.target as HTMLInputElement
  const value = Number(target.value)
  if (Number.isNaN(value)) return
  materialsStore.updateQuantity(categoryId, itemId, value)
}

const currencyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 0
})

function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

function exportAll() {
  const rows = materialsStore.flatItems.map(item => ({
    kategori: item.categoryName,
    urun: item.name,
    stok: item.stock_qty,
    min_stok: item.min_stock,
    bekleyen: item.pending,
    kalan: item.stock_qty - item.pending,
    birim_maliyet: item.unit_cost,
    konum: item.location
  }))
  downloadCSV(
    `stok_tam_${new Date().toISOString().slice(0, 10)}.csv`,
    toCSV(rows, ['kategori', 'urun', 'stok', 'min_stok', 'bekleyen', 'kalan', 'birim_maliyet', 'konum'])
  )
}
</script>
