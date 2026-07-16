import * as pdfjsLib from "pdfjs-dist";

let workerConfigured = false;

function ensureWorker() {
  if (workerConfigured) return;
  pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;
  workerConfigured = true;
}

export async function loadPdfDocument(source: string | ArrayBuffer) {
  ensureWorker();
  const loadingTask = pdfjsLib.getDocument(typeof source === "string" ? { url: source } : { data: source });
  return loadingTask.promise;
}

export async function renderPdfPageToCanvas(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  scale = 2,
  options?: { forcePortrait?: boolean }
): Promise<HTMLCanvasElement> {
  const forcePortrait = options?.forcePortrait ?? true;
  const page = await pdfDoc.getPage(pageNumber);

  // Viewport dasar (menghormati rotasi bawaan halaman PDF, jika ada)
  const baseViewport = page.getViewport({ scale });

  // Banyak label pengiriman (resi) diekspor dengan ukuran halaman landscape
  // walau isinya sebenarnya untuk kertas thermal potrait. Jika lebar > tinggi,
  // putar 90 derajat agar hasil render selalu potrait.
  const isLandscape = baseViewport.width > baseViewport.height;
  const extraRotation = forcePortrait && isLandscape ? 90 : 0;
  const viewport =
    extraRotation === 0 ? baseViewport : page.getViewport({ scale, rotation: (page.rotate + extraRotation) % 360 });

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D context tidak tersedia");

  await page.render({ canvasContext: context, viewport }).promise;
  return canvas;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.readAsDataURL(file);
  });
}

export function dataUrlToArrayBuffer(dataUrl: string): ArrayBuffer {
  const base64 = dataUrl.split(",")[1] ?? "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
