export type PaperSize = "58mm" | "80mm" | "custom";

export type MarketplaceSource = "shopee" | "tokopedia" | "lazada" | "tiktokshop" | "lainnya";

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface CropPreset {
  id: string;
  name: string;
  paperSize: PaperSize;
  rect: CropRect;
  createdAt: number;
}

export interface ImageAdjustments {
  brightness: number;
  contrast: number;
  threshold: number;
  dithering: boolean;
  grayscale: boolean;
  sharpen: boolean;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
}

export const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
  brightness: 0,
  contrast: 0,
  threshold: 128,
  dithering: true,
  grayscale: true,
  sharpen: false,
  marginTop: 4,
  marginBottom: 4,
  marginLeft: 0,
  marginRight: 0,
};

export interface ResiHistoryItem {
  id: string;
  fileName: string;
  source: MarketplaceSource;
  pdfDataUrl: string;
  croppedImageDataUrl: string;
  pageIndex: number;
  cropRect: CropRect;
  adjustments: ImageAdjustments;
  paperSize: PaperSize;
  status: "printed" | "saved" | "failed";
  createdAt: number;
  printedAt?: number;
  copies: number;
}

export interface BluetoothPrinterDevice {
  id: string;
  name: string;
  connected: boolean;
  lastConnectedAt?: number;
}

export type PrintStatus = "idle" | "connecting" | "printing" | "success" | "error";

export interface AppSettings {
  theme: "light" | "dark" | "system";
  language: "id" | "en";
  defaultPaperSize: PaperSize;
  defaultAdjustments: ImageAdjustments;
  autoReconnect: boolean;
  lastPrinterId?: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
  language: "id",
  defaultPaperSize: "58mm",
  defaultAdjustments: DEFAULT_ADJUSTMENTS,
  autoReconnect: true,
};
