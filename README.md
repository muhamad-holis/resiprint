# ResiPrint

**Cetak Resi Marketplace Lebih Mudah** — PWA untuk mencetak resi Shopee,
Tokopedia, Lazada, dan TikTok Shop langsung ke printer thermal Bluetooth.
100% berjalan di browser (client-side), tanpa server, tanpa database,
offline-first, dan siap dibungkus menjadi aplikasi Android via
Trusted Web Activity (TWA).

## Fitur Utama

- 📄 Upload PDF resi (drag & drop atau pilih file)
- 🖼️ Preview PDF multi-halaman dengan zoom & scroll
- ✂️ Crop editor dengan gesture (drag, resize, pinch-zoom, rotate) + preset 58mm/80mm
- 🎛️ Simulasi cetak thermal: brightness, contrast, threshold, dithering, margin
- 🔵 Cetak via Bluetooth (Web Bluetooth API) ke printer ESC/POS 58mm/80mm
- 🔁 Auto-reconnect printer setelah terputus / refresh halaman
- 🗂️ Riwayat cetak, cetak ulang, export gambar
- 📲 Installable ke Android (PWA + TWA), berjalan offline

## Stack Teknologi

Next.js 15 (App Router) · TypeScript (strict) · TailwindCSS · shadcn/ui ·
Framer Motion · Lucide Icons · pdf.js · Zustand · next-pwa

---

## 1. Instalasi

```bash
git clone <url-repo-kamu>
cd resiprint
npm install
```

`npm install` otomatis menyalin `pdf.worker.min.mjs` ke folder `public/`
lewat script `postinstall` (`scripts/copy-pdf-worker.mjs`).

## 2. Development

```bash
npm run dev
```

Buka `http://localhost:3000`. PWA (service worker) dinonaktifkan otomatis
saat development agar tidak mengganggu hot-reload.

Perintah lain yang tersedia:

```bash
npm run lint          # ESLint
npm run lint:fix       # ESLint + auto-fix
npm run format         # Prettier
npm run type-check     # TypeScript strict check
```

## 3. Build Production

```bash
npm run build
npm run start
```

## 4. Deploy ke Vercel

### Cara cepat (dashboard)
1. Push repo ini ke GitHub.
2. Buka [vercel.com](https://vercel.com) → **New Project** → import repo.
3. Framework preset otomatis terdeteksi sebagai **Next.js**. Klik **Deploy**.

### Cara CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Deploy otomatis via GitHub Actions
Workflow `.github/workflows/deploy.yml` sudah disiapkan untuk deploy
otomatis ke Vercel setiap push ke branch `main`. Tambahkan secret berikut
di **Settings → Secrets and variables → Actions**:

| Secret | Cara mendapatkan |
|---|---|
| `VERCEL_TOKEN` | Vercel → Settings → Tokens → Create |

Project juga perlu di-link sekali secara lokal agar ada `.vercel/project.json`:
```bash
vercel link
```

---

## 5. Setup Domain

1. Di dashboard Vercel, buka project → **Settings → Domains** → tambahkan
   domain kamu (misal `resiprint.app`).
2. Arahkan DNS domain ke Vercel sesuai instruksi yang ditampilkan
   (biasanya CNAME ke `cname.vercel-dns.com` atau A record ke IP Vercel).
3. Tunggu status domain menjadi **Valid** (biasanya beberapa menit–jam).
4. Update semua referensi domain di project:
   - `twa-manifest.json` → `"host"`, `iconUrl`, `webManifestUrl`, `fullScopeUrl`
   - `public/robots.txt` → baris `Sitemap:`
   - `app/sitemap.ts` → `baseUrl`

---

## 6. Setup Digital Asset Links (assetlinks.json)

Digital Asset Links memberi tahu Chrome bahwa APK Android kamu adalah
pemilik sah domain tersebut, sehingga TWA bisa berjalan **tanpa address
bar** (full-screen seperti aplikasi native).

1. File `public/.well-known/assetlinks.json` sudah disiapkan. File ini
   akan otomatis ter-deploy ke `https://<domain-kamu>/.well-known/assetlinks.json`
   karena berada di folder `public/`.
2. Ganti `package_name` jika kamu mengubah `packageId` di `twa-manifest.json`.
3. Ganti `sha256_cert_fingerprints` dengan fingerprint keystore signing kamu
   (lihat langkah generate fingerprint di bagian 8 di bawah).
4. Verifikasi setelah deploy:
   ```bash
   curl https://<domain-kamu>/.well-known/assetlinks.json
   ```
   Atau gunakan [Statement List Generator & Tester](https://developers.google.com/digital-asset-links/tools/generator)
   dari Google.

---

## 7. Setup Android TWA (Bubblewrap)

Prasyarat: **Node.js 20+**, **JDK 17**, koneksi internet untuk download
Android SDK saat pertama kali (Bubblewrap akan menawarkan install otomatis).

```bash
npm install -g @bubblewrap/cli
cd android
bubblewrap init --manifest=./twa-manifest.json
```

Bubblewrap akan menghasilkan project Gradle Android lengkap (`app/`,
`gradlew`, `gradle/wrapper/`, `build.gradle`, dsb) berdasarkan
`twa-manifest.json` yang sudah dikonfigurasi (nama app, warna tema, ikon,
shortcut, dan domain `resiprint.app`).

### Update project setelah `twa-manifest.json` berubah
```bash
bubblewrap update
```

---

## 8. Generate Keystore & SHA-256 Fingerprint

Saat `bubblewrap init` dijalankan, kamu akan diminta membuat keystore baru
(atau bisa generate manual):

```bash
keytool -genkey -v -keystore android.keystore -alias resiprint-key \
  -keyalg RSA -keysize 2048 -validity 10000
```

⚠️ **Simpan file `android.keystore` dan password-nya di tempat aman.**
Jika hilang, kamu tidak bisa update aplikasi yang sudah live di Play Store.
File keystore **tidak boleh** di-commit ke Git (sudah ada di `.gitignore`).

Ambil SHA-256 fingerprint untuk diisi ke `assetlinks.json`:

```bash
keytool -list -v -keystore android.keystore -alias resiprint-key
```

Salin nilai `SHA256:` (format `AA:BB:CC:...`) ke
`public/.well-known/assetlinks.json`, lalu redeploy web app.

Untuk build otomatis via GitHub Actions (`android-build.yml`), tambahkan
secrets berikut:

| Secret | Isi |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | `base64 -i android.keystore` (isi hasilnya) |
| `ANDROID_KEYSTORE_PASSWORD` | Password keystore |
| `ANDROID_KEY_ALIAS` | `resiprint-key` |
| `ANDROID_KEY_PASSWORD` | Password key alias |

---

## 9. Generate APK / AAB

### Manual (lokal)
```bash
cd android
bubblewrap build
```
Menghasilkan:
- `app-release-signed.apk` — untuk testing manual / sideload
- `app-release-bundle.aab` — untuk upload ke Google Play

### Via GitHub Actions
Buka tab **Actions → Build Android (TWA) → Run workflow**, pilih
`debug` (APK cepat untuk testing) atau `release` (AAB + APK bertanda
tangan, butuh secrets di atas). Hasil build bisa diunduh di bagian
**Artifacts** setelah workflow selesai.

---

## 10. Publish ke Google Play

1. Buat akun [Google Play Console](https://play.google.com/console) (biaya
   pendaftaran satu kali).
2. **Create app** → isi nama, bahasa default (Indonesia), kategori
   (Business/Shopping).
3. Lengkapi **Store listing**: deskripsi singkat & lengkap, screenshot
   (min. 2, rasio 16:9 atau 9:16), ikon 512×512, feature graphic 1024×500.
4. Buka **Production → Create new release**, upload file `.aab` hasil
   build release.
5. Isi **Content rating**, **Target audience**, **Data safety** (jelaskan
   bahwa app tidak mengirim data resi ke server manapun — semua diproses
   lokal di perangkat).
6. Submit untuk review. Biasanya butuh beberapa jam hingga beberapa hari.

Tips: karena ResiPrint adalah TWA, pastikan `assetlinks.json` sudah
terverifikasi **sebelum** submit, agar aplikasi tidak menampilkan address
bar Chrome saat direview.

---

## Struktur Folder

```
app/                # Next.js App Router — routing & pages
components/
  ui/                # shadcn/ui primitives (button, card, dialog, dst)
  features/          # Komponen spesifik fitur (upload, crop, printer, dst)
hooks/               # Custom React hooks
lib/                 # Utilitas murni (image processing, ESC/POS, pdf.js, crop)
services/            # Wrapper API eksternal (Web Bluetooth)
store/               # Zustand stores (history, settings, print job, preset)
types/               # TypeScript types & default values
workers/             # (reserved) web worker untuk image processing berat
public/              # Asset statis, manifest PWA, ikon, assetlinks.json
android/             # Konfigurasi Bubblewrap TWA
.github/             # CI/CD workflows, issue & PR templates
```

## Prinsip Desain & Arsitektur

- **Tanpa backend** — semua pemrosesan PDF, crop, image processing, dan
  ESC/POS encoding berjalan di browser (client-side).
- **Offline-first** — data resi & riwayat disimpan di IndexedDB (via
  `idb-keyval`) dan pengaturan di localStorage, dibungkus service worker
  (`next-pwa`) untuk caching aset & offline fallback.
- **Strict TypeScript** — tanpa `any`, `noUncheckedIndexedAccess` aktif.
- **Aksesibilitas** — navigasi keyboard, `aria-current`, kontras warna
  sesuai WCAG AA pada palet biru/putih.

## Troubleshooting

**Printer tidak terdeteksi saat scan Bluetooth**
- Pastikan menggunakan **Chrome di Android** (Web Bluetooth tidak
  didukung Safari/iOS maupun sebagian besar browser desktop).
- Aktifkan izin **Lokasi** di Android (diperlukan OS Android agar Chrome
  bisa memindai perangkat Bluetooth).
- Pastikan printer dalam mode pairing/discoverable.

**Hasil cetak buram / garis-garis**
- Coba nonaktifkan **Dithering** dan gunakan **Threshold** manual, lalu
  sesuaikan nilainya sambil melihat preview.
- Naikkan **Contrast** sedikit untuk teks tipis.

**Printer terputus saat mencetak banyak salinan**
- Beberapa printer BLE murah punya buffer kecil — kurangi jumlah salinan
  sekaligus, atau aktifkan **Auto Reconnect** di Pengaturan.

**Address bar Chrome masih muncul di APK Android**
- Berarti `assetlinks.json` belum terverifikasi. Cek ulang `package_name`
  dan `sha256_cert_fingerprints`, pastikan file bisa diakses publik di
  `https://<domain>/.well-known/assetlinks.json`, lalu build ulang APK.

## FAQ

**Apakah data resi saya dikirim ke server?**
Tidak. ResiPrint tidak memiliki backend — file PDF, hasil crop, dan
riwayat cetak seluruhnya disimpan lokal di perangkat kamu (IndexedDB).

**Apakah bisa dipakai di iPhone?**
PWA-nya bisa dibuka, tapi fitur cetak Bluetooth **tidak akan berfungsi**
karena Safari/iOS belum mendukung Web Bluetooth API. ResiPrint didesain
untuk Chrome Android.

**Printer thermal apa saja yang didukung?**
Printer thermal 58mm/80mm berbasis ESC/POS yang mendukung raster bitmap
printing (`GS v 0`) via Bluetooth Low Energy — mayoritas printer thermal
portable yang dijual di marketplace Indonesia (XP-58, PT-210, dan sejenisnya).

## Lisensi

MIT — lihat [LICENSE](./LICENSE).
