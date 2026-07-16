import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CropPreset, CropRect, PaperSize } from "@/types";
import { generateId } from "@/lib/utils";

export const PAPER_PRESET_DIMENSIONS: Record<Exclude<PaperSize, "custom">, { widthMm: number }> = {
  "58mm": { widthMm: 48 },
  "80mm": { widthMm: 72 },
};

interface CropPresetState {
  presets: CropPreset[];
  savePreset: (name: string, paperSize: PaperSize, rect: CropRect) => CropPreset;
  deletePreset: (id: string) => void;
}

export const useCropPresetStore = create<CropPresetState>()(
  persist(
    (set) => ({
      presets: [],
      savePreset: (name, paperSize, rect) => {
        const preset: CropPreset = {
          id: generateId(),
          name,
          paperSize,
          rect,
          createdAt: Date.now(),
        };
        set((state) => ({ presets: [preset, ...state.presets] }));
        return preset;
      },
      deletePreset: (id) => {
        set((state) => ({ presets: state.presets.filter((p) => p.id !== id) }));
      },
    }),
    { name: "resiprint-crop-presets" }
  )
);
