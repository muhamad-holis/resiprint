"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/store/settings-store";

/**
 * Menerapkan pengaturan tema (light/dark/system) ke elemen <html>.
 * Sebelumnya `settings.theme` hanya tersimpan di store tapi tidak pernah
 * benar-benar dipakai untuk mengubah tampilan — komponen ini menutup celah itu.
 */
export function ThemeApplier() {
  const theme = useSettingsStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
      return;
    }
    if (theme === "light") {
      root.classList.remove("dark");
      return;
    }

    // theme === "system": ikuti preferensi OS, dan pantau perubahannya
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = (isDark: boolean) => root.classList.toggle("dark", isDark);
    apply(mql.matches);

    const listener = (e: MediaQueryListEvent) => apply(e.matches);
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  }, [theme]);

  return null;
}
