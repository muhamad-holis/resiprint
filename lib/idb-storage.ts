import { get, set, del } from "idb-keyval";
import type { StateStorage } from "zustand/middleware";

/**
 * Adapter penyimpanan Zustand berbasis IndexedDB (via idb-keyval).
 * Dipakai untuk data besar seperti riwayat resi (menyimpan PDF/gambar base64)
 * yang tidak muat di localStorage (~5-10MB limit).
 */
export const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) ?? null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};
