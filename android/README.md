# ResiPrint — Android (Trusted Web Activity)

Folder ini berisi konfigurasi untuk membungkus ResiPrint PWA menjadi aplikasi
Android menggunakan **Bubblewrap** (TWA — Trusted Web Activity).

Project Gradle lengkap (folder `app/`, `gradlew`, `gradlew.bat`, `gradle/wrapper/`)
**sengaja tidak di-commit sebagai binary jadi di repo ini** — file tersebut
dihasilkan secara deterministik oleh Bubblewrap dari `twa-manifest.json`
di folder ini, dan sebaiknya di-generate ulang oleh Bubblewrap ketimbang
disalin manual, supaya versi Gradle Wrapper & AGP selalu konsisten dengan
environment build kamu. Ikuti langkah di README utama project
(bagian "Setup Android TWA") untuk generate.

Ringkas:

```bash
npm install -g @bubblewrap/cli
cd android
bubblewrap init --manifest=./twa-manifest.json
bubblewrap build
```

File penting di folder ini:
- `twa-manifest.json` — konfigurasi TWA (package id, warna tema, ikon, shortcut)
- `../public/.well-known/assetlinks.json` — Digital Asset Links, WAJIB di-host
  di `https://<domain-kamu>/.well-known/assetlinks.json` agar Chrome
  mempercayai APK sebagai pemilik domain (menghilangkan address bar).

Lihat README utama untuk instruksi lengkap generate keystore, generate
SHA-256 fingerprint, build APK/AAB, dan publish ke Google Play.
