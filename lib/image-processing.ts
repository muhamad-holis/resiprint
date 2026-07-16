import type { ImageAdjustments } from "@/types";

/**
 * Semua pemrosesan gambar dilakukan sepenuhnya di browser (client-side),
 * tidak ada data yang dikirim ke server manapun.
 */

export function toGrayscale(imageData: ImageData): ImageData {
  const { data } = imageData;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] ?? 0;
    const g = data[i + 1] ?? 0;
    const b = data[i + 2] ?? 0;
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }
  return imageData;
}

export function applyBrightnessContrast(
  imageData: ImageData,
  brightness: number,
  contrast: number
): ImageData {
  const { data } = imageData;
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const channel = data[i + c] ?? 0;
      let value = factor * (channel - 128) + 128 + brightness;
      value = Math.max(0, Math.min(255, value));
      data[i + c] = value;
    }
  }
  return imageData;
}

export function applySharpen(imageData: ImageData): ImageData {
  const { width, height, data } = imageData;
  const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
  const output = new Uint8ClampedArray(data.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        let k = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const px = Math.min(width - 1, Math.max(0, x + kx));
            const py = Math.min(height - 1, Math.max(0, y + ky));
            const idx = (py * width + px) * 4 + c;
            sum += (data[idx] ?? 0) * (kernel[k] ?? 0);
            k++;
          }
        }
        const outIdx = (y * width + x) * 4 + c;
        output[outIdx] = Math.max(0, Math.min(255, sum));
      }
      const alphaIdx = (y * width + x) * 4 + 3;
      output[alphaIdx] = data[alphaIdx] ?? 255;
    }
  }
  return new ImageData(output, width, height);
}

/** Threshold biner sederhana — hitam/putih tegas, cocok untuk teks & barcode */
export function applyThreshold(imageData: ImageData, threshold: number): ImageData {
  const { data } = imageData;
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] ?? 0;
    const value = gray >= threshold ? 255 : 0;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
  }
  return imageData;
}

/** Floyd-Steinberg dithering — hasil lebih halus untuk gambar/foto pada printer thermal 1-bit */
export function applyFloydSteinbergDithering(imageData: ImageData): ImageData {
  const { width, height, data } = imageData;
  const gray = new Float32Array(width * height);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    gray[p] = data[i] ?? 0;
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const oldPixel = gray[idx] ?? 0;
      const newPixel = oldPixel < 128 ? 0 : 255;
      gray[idx] = newPixel;
      const error = oldPixel - newPixel;

      if (x + 1 < width) {
        const i1 = idx + 1;
        gray[i1] = (gray[i1] ?? 0) + (error * 7) / 16;
      }
      if (x - 1 >= 0 && y + 1 < height) {
        const i2 = idx + width - 1;
        gray[i2] = (gray[i2] ?? 0) + (error * 3) / 16;
      }
      if (y + 1 < height) {
        const i3 = idx + width;
        gray[i3] = (gray[i3] ?? 0) + (error * 5) / 16;
      }
      if (x + 1 < width && y + 1 < height) {
        const i4 = idx + width + 1;
        gray[i4] = (gray[i4] ?? 0) + (error * 1) / 16;
      }
    }
  }

  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const value = gray[p] ?? 0;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
  }
  return imageData;
}

export type ProcessImageOptions = ImageAdjustments;

export function processImageForThermalPrint(
  canvas: HTMLCanvasElement,
  options: ProcessImageOptions
): HTMLCanvasElement {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas 2D context tidak tersedia");

  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  if (options.grayscale) imageData = toGrayscale(imageData);
  if (options.brightness !== 0 || options.contrast !== 0) {
    imageData = applyBrightnessContrast(imageData, options.brightness, options.contrast);
  }
  if (options.sharpen) imageData = applySharpen(imageData);
  if (options.dithering) {
    imageData = applyFloydSteinbergDithering(imageData);
  } else {
    imageData = applyThreshold(imageData, options.threshold);
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/** Terapkan margin/padding putih di sekeliling canvas hasil crop sebelum dicetak */
export function applyMargins(
  source: HTMLCanvasElement,
  margins: { top: number; bottom: number; left: number; right: number }
): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = source.width + margins.left + margins.right;
  out.height = source.height + margins.top + margins.bottom;
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context tidak tersedia");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.drawImage(source, margins.left, margins.top);
  return out;
}
