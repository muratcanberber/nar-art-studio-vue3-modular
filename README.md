# NAR Art Studio Yönetim Paneli

Nuxt 3 ve Nuxt UI ile oluşturulmuş sade bir finans dashboard'u. Veriler yerel SQLite veritabanında tutulur ve tüm rotalar kimlik doğrulaması olmadan erişilemez.

## Başlangıç

```bash
# Bağımlılıkları kur
bun install

# Geliştirme sunucusunu başlat
bun run dev
```

İlk kurulumda aşağıdaki kullanıcı otomatik olarak eklenir:

- Kullanıcı adı: `admin`
- Şifre: `narstudio123`

Lütfen canlı ortama geçerken şifreyi güncelleyin.

## Teknoloji Yığını
- Nuxt 3 + TypeScript
- Nuxt UI bileşenleri
- TailwindCSS (Nuxt UI ile birlikte gelir)
- SQLite (better-sqlite3)
- Basit oturum yönetimi (HTTP-only cookie)

## Dizim
- `components/` : Finans ekranı
- `composables/` : CSV ve tarih yardımcıları
- `layouts/` : Dashboard yerleşimi
- `server/api/` : Veriler ve kimlik doğrulama için endpoint'ler
- `server/plugins/` : Veritabanı kurulumu ve seed veriler
- `server/utils/` : Veritabanı & oturum yardımcıları

## Script'ler

```bash
bun run dev      # Geliştirme
bun run build    # Üretim build
bun run preview  # Build sonrası önizleme
```
