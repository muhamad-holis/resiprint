import { create } from "zustand";
import type { CropRect, ImageAdjustments, MarketplaceSource, PaperSize } from "@/types";
import { DEFAULT_ADJUSTMENTS } from "@/types";

interface PrintJobState {
  fileName: string | null;
  pdfDataUrl: string | null;
  source: MarketplaceSource;
  pageCount: number;
  currentPage: number;
  cropRect: CropRect | null;
  adjustments: ImageAdjustments;
  paperSize: PaperSize;
  croppedCanvas: HTMLCanvasElement | null;

  setPdf: (fileName: string, pdfDataUrl: string, pageCount: number, source?: MarketplaceSource) => void;
  setCurrentPage: (page: number) => void;
  setCropRect: (rect: CropRect) => void;
  setAdjustments: (adjustments: Partial<ImageAdjustments>) => void;
  setPaperSize: (size: PaperSize) => void;
  setCroppedCanvas: (canvas: HTMLCanvasElement | null) => void;
  reset: () => void;
}

const initialState = {
  fileName: null,
  pdfDataUrl: null,
  source: "lainnya" as MarketplaceSource,
  pageCount: 0,
  currentPage: 0,
  cropRect: null,
  adjustments: DEFAULT_ADJUSTMENTS,
  paperSize: "58mm" as PaperSize,
  croppedCanvas: null,
};

export const usePrintJobStore = create<PrintJobState>()((set) => ({
  ...initialState,
  setPdf: (fileName, pdfDataUrl, pageCount, source = "lainnya") =>
    set({ fileName, pdfDataUrl, pageCount, source, currentPage: 0 }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setCropRect: (rect) => set({ cropRect: rect }),
  setAdjustments: (adjustments) =>
    set((state) => ({ adjustments: { ...state.adjustments, ...adjustments } })),
  setPaperSize: (paperSize) => set({ paperSize }),
  setCroppedCanvas: (canvas) => set({ croppedCanvas: canvas }),
  reset: () => set(initialState),
}));
