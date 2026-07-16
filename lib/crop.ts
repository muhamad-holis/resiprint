import type { CropRect } from "@/types";

/**
 * Menghasilkan canvas baru berisi hasil crop dari source canvas,
 * berdasarkan CropRect berbasis persentase (0-1) dan rotasi (kelipatan 90 derajat).
 */
export function extractCroppedCanvas(source: HTMLCanvasElement, rect: CropRect): HTMLCanvasElement {
  const rotated = rect.rotation % 360 === 0 ? source : rotateCanvas(source, rect.rotation);

  const sx = Math.round(rect.x * rotated.width);
  const sy = Math.round(rect.y * rotated.height);
  const sw = Math.round(rect.width * rotated.width);
  const sh = Math.round(rect.height * rotated.height);

  const out = document.createElement("canvas");
  out.width = Math.max(1, sw);
  out.height = Math.max(1, sh);
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context tidak tersedia");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.drawImage(rotated, sx, sy, sw, sh, 0, 0, out.width, out.height);
  return out;
}

function rotateCanvas(source: HTMLCanvasElement, degrees: number): HTMLCanvasElement {
  const normalized = ((degrees % 360) + 360) % 360;
  const swapDims = normalized === 90 || normalized === 270;

  const out = document.createElement("canvas");
  out.width = swapDims ? source.height : source.width;
  out.height = swapDims ? source.width : source.height;

  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context tidak tersedia");

  ctx.translate(out.width / 2, out.height / 2);
  ctx.rotate((normalized * Math.PI) / 180);
  ctx.drawImage(source, -source.width / 2, -source.height / 2);

  return out;
}

/** Resize canvas agar lebar-nya sesuai target dot printer, mempertahankan rasio */
export function resizeCanvasToWidth(source: HTMLCanvasElement, targetWidth: number): HTMLCanvasElement {
  const ratio = targetWidth / source.width;
  const targetHeight = Math.round(source.height * ratio);

  const out = document.createElement("canvas");
  out.width = targetWidth;
  out.height = targetHeight;
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context tidak tersedia");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, targetWidth, targetHeight);
  return out;
}

export function canvasToDataUrl(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL("image/png");
}
