"use client";

import { Info, Moon, Sun, Monitor } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useSettingsStore } from "@/store/settings-store";
import type { PaperSize } from "@/types";

const APP_VERSION = "1.0.0";

export default function SettingsPage() {
  const settings = useSettingsStore();

  return (
    <main className="safe-top mx-auto min-h-dvh max-w-[440px] px-4 pb-28 pt-6">
      <h1 className="mb-4 text-xl font-bold">Pengaturan</h1>

      <SectionLabel>Tampilan</SectionLabel>
      <Card className="mb-5">
        <CardContent className="flex flex-col divide-y divide-border p-0">
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-sm font-medium">Tema</span>
            <div className="flex gap-1">
              {[
                { key: "light", icon: Sun },
                { key: "dark", icon: Moon },
                { key: "system", icon: Monitor },
              ].map(({ key, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => settings.updateSettings({ theme: key as typeof settings.theme })}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    settings.theme === key ? "bg-primary text-primary-foreground" : "bg-secondary"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-sm font-medium">Bahasa</span>
            <div className="flex gap-1.5">
              {(["id", "en"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => settings.updateSettings({ language: lang })}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    settings.language === lang ? "bg-primary text-primary-foreground" : "bg-secondary"
                  }`}
                >
                  {lang === "id" ? "Indonesia" : "English"}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <SectionLabel>Cetak</SectionLabel>
      <Card className="mb-5">
        <CardContent className="flex flex-col divide-y divide-border p-0">
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-sm font-medium">Ukuran Kertas Default</span>
            <div className="flex gap-1.5">
              {(["58mm", "80mm"] as PaperSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => settings.updateSettings({ defaultPaperSize: size })}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    settings.defaultPaperSize === size ? "bg-primary text-primary-foreground" : "bg-secondary"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <div>
              <p className="text-sm font-medium">Auto Reconnect Printer</p>
              <p className="text-xs text-muted-foreground">Sambungkan ulang otomatis saat terputus</p>
            </div>
            <Switch
              checked={settings.autoReconnect}
              onCheckedChange={(v) => settings.updateSettings({ autoReconnect: v })}
            />
          </div>
        </CardContent>
      </Card>

      <SectionLabel>Tentang</SectionLabel>
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">ResiPrint</p>
            <p className="text-xs text-muted-foreground">Versi {APP_VERSION}</p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{children}</p>;
}
