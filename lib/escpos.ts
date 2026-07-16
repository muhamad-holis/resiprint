/**
 * ESC/POS command encoder — mengubah canvas hasil crop menjadi perintah
 * raster bitmap (GS v 0) yang dipahami printer thermal 58mm/80mm.
 */

const ESC = 0x1b;
const GS = 0x1d;

export const ESC_POS = {
  INIT: new Uint8Array([ESC, 0x40]),
  LINE_FEED: new Uint8Array([0x0a]),
  CUT_PARTIAL: new Uint8Array([GS, 0x56, 0x01]),
  CUT_FULL: new Uint8Array([GS, 0x56, 0x00]),
};

/** Lebar cetak dalam dot, dibulatkan ke kelipatan 8 (byte-aligned) */
export function getPrintWidthDots(paperSize: "58mm" | "80mm" | "custom"): number {
  switch (paperSize) {
    case "58mm":
      return 384; // 203dpi, ~48mm printable area
    case "80mm":
      return 576; // 203dpi, ~72mm printable area
    default:
      return 384;
  }
}

/**
 * Konversi canvas (sudah 1-bit/threshold) menjadi bytes ESC/POS GS v 0 raster.
 * Canvas WAJIB sudah diproses (grayscale + threshold/dithering) sebelumnya.
 */
export function canvasToEscPosRaster(canvas: HTMLCanvasElement): Uint8Array {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas 2D context tidak tersedia");

  const width = canvas.width;
  const height = canvas.height;
  const widthBytes = Math.ceil(width / 8);
  const imageData = ctx.getImageData(0, 0, width, height);
  const { data } = imageData;

  const raster = new Uint8Array(widthBytes * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx] ?? 255;
      // Anggap pixel gelap (nilai rendah) sebagai "hitam" -> bit = 1
      const isBlack = r < 128;
      if (isBlack) {
        const byteIndex = y * widthBytes + (x >> 3);
        const bitIndex = 7 - (x % 8);
        raster[byteIndex] = (raster[byteIndex] ?? 0) | (1 << bitIndex);
      }
    }
  }

  const xL = widthBytes & 0xff;
  const xH = (widthBytes >> 8) & 0xff;
  const yL = height & 0xff;
  const yH = (height >> 8) & 0xff;

  const header = new Uint8Array([GS, 0x76, 0x30, 0x00, xL, xH, yL, yH]);

  const result = new Uint8Array(header.length + raster.length);
  result.set(header, 0);
  result.set(raster, header.length);
  return result;
}

export function buildPrintJob(
  canvas: HTMLCanvasElement,
  copies: number,
  cutAfter = true
): Uint8Array {
  const rasterCmd = canvasToEscPosRaster(canvas);
  const chunks: Uint8Array[] = [ESC_POS.INIT];

  for (let i = 0; i < copies; i++) {
    chunks.push(rasterCmd);
    chunks.push(ESC_POS.LINE_FEED);
    chunks.push(ESC_POS.LINE_FEED);
    chunks.push(ESC_POS.LINE_FEED);
  }
  if (cutAfter) chunks.push(ESC_POS.CUT_PARTIAL);

  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
  const out = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

/** Bagi payload besar menjadi potongan sesuai MTU BLE (default aman: 180 byte) */
export function chunkBytes(bytes: Uint8Array, chunkSize = 180): Uint8Array[] {
  const chunks: Uint8Array[] = [];
  for (let i = 0; i < bytes.length; i += chunkSize) {
    chunks.push(bytes.slice(i, i + chunkSize));
  }
  return chunks;
}
