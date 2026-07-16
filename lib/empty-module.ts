/**
 * Modul kosong pengganti paket native `canvas` di sisi client.
 * `pdfjs-dist` secara opsional mencoba resolve `canvas` untuk penggunaan
 * di Node.js — di browser modul ini tidak dibutuhkan sama sekali, jadi
 * kita alias ke file kosong ini (lihat next.config.mjs) agar bundler
 * tidak gagal saat mencoba resolve dependency native tersebut.
 */
export default {};
