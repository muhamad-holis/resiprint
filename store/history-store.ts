import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { idbStorage } from "@/lib/idb-storage";
import type { ResiHistoryItem } from "@/types";
import { generateId } from "@/lib/utils";

interface HistoryState {
  items: ResiHistoryItem[];
  addItem: (item: Omit<ResiHistoryItem, "id" | "createdAt">) => ResiHistoryItem;
  updateItem: (id: string, patch: Partial<ResiHistoryItem>) => void;
  removeItem: (id: string) => void;
  clearAll: () => void;
  getById: (id: string) => ResiHistoryItem | undefined;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const newItem: ResiHistoryItem = {
          ...item,
          id: generateId(),
          createdAt: Date.now(),
        };
        set((state) => ({ items: [newItem, ...state.items] }));
        return newItem;
      },
      updateItem: (id, patch) => {
        set((state) => ({
          items: state.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
        }));
      },
      removeItem: (id) => {
        set((state) => ({ items: state.items.filter((it) => it.id !== id) }));
      },
      clearAll: () => set({ items: [] }),
      getById: (id) => get().items.find((it) => it.id === id),
    }),
    {
      name: "resiprint-history",
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
