import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_SETTINGS, type AppSettings } from "@/types";

interface SettingsState extends AppSettings {
  updateSettings: (patch: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      updateSettings: (patch) => set((state) => ({ ...state, ...patch })),
      resetSettings: () => set(DEFAULT_SETTINGS),
    }),
    { name: "resiprint-settings" }
  )
);
