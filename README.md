# NAR Art Studio – Vue 3 Modular (PWA-ready, Dark, Mobile-first)

Minimal yönetim paneli. Yerel geliştirme için adımlar:

```bash
# 1) Bağımlılıkları kur
npm install

# 2) Geliştirme sunucusu
npm run dev

# 3) Build + preview
npm run build
npm run preview
```

## İçerik
- Vue 3 + Vite + TypeScript
- TailwindCSS (dark mode)
- Pinia (stores) – mock veriler
- lucide-vue-next (ikonlar)
- echarts + vue-echarts (grafikler)

## Dosya Yapısı
- src/components/* : Ekranlar ve UI parçaları
- src/stores/* : Pinia store'lar (orders, shipments, materials, finance)
- src/composables/* : CSV ve tarih yardımcıları

## Notlar
- WhatsApp linkleri `wa.me` ile çalışır.
- Shopier ödeme özeti: Çarşamba 09:00 (yaklaşan).
- Her ekranın E-Tablo (CSV) dışa aktarma butonu vardır.
- PWA kaydı eklemek istersen Vite PWA plugin kurulumu yapılmalı.
