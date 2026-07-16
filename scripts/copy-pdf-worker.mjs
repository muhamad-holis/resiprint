// Menyalin pdf.worker.min.mjs dari node_modules/pdfjs-dist ke public/
// agar bisa di-serve secara statis dan dipakai oleh lib/pdf.ts.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const src = join(root, "node_modules", "pdfjs-dist", "build", "pdf.worker.min.mjs");
const destDir = join(root, "public");
const dest = join(destDir, "pdf.worker.min.mjs");

try {
  if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });
  if (existsSync(src)) {
    copyFileSync(src, dest);
    console.log("[copy-pdf-worker] pdf.worker.min.mjs berhasil disalin ke public/");
  } else {
    console.warn("[copy-pdf-worker] Sumber worker tidak ditemukan, lewati (mungkin versi pdfjs-dist berbeda).");
  }
} catch (err) {
  console.warn("[copy-pdf-worker] Gagal menyalin worker:", err.message);
}
