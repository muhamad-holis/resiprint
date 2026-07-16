"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bluetooth, BluetoothOff, FileText, History, Printer as PrinterIcon, Settings } from "lucide-react";
import { UploadCard } from "@/components/features/upload/upload-card";
import { SplashScreen } from "@/components/features/splash-screen";
import { Card, CardContent } from "@/components/ui/card";
import { useHistoryStore } from "@/store/history-store";
import { usePrinterConnection } from "@/hooks/use-printer-connection";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

const SOURCE_LABEL: Record<string, string> = {
  shopee: "Shopee",
  tokopedia: "Tokopedia",
  lazada: "Lazada",
  tiktokshop: "TikTok Shop",
  lainnya: "Lainnya",
};

export default function HomePage() {
  const items = useHistoryStore((s) => s.items).slice(0, 3);
  const { connected, deviceName } = usePrinterConnection();
  const router = useRouter();

  return (
    <>
      <SplashScreen />
      <main className="safe-top mx-auto min-h-dvh max-w-[440px] px-4 pb-28 pt-6">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Selamat datang di</p>
            <h1 className="text-xl font-bold text-foreground">
              Resi<span className="text-primary">Print</span>
            </h1>
          </div>
          <Link
            href="/settings"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </header>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <UploadCard />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card
            className="mb-4 cursor-pointer"
            onClick={() => router.push("/printer")}
          >
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    connected ? "bg-primary-50 text-primary" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {connected ? <Bluetooth className="h-5 w-5" /> : <BluetoothOff className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-sm font-semibold">{connected ? deviceName ?? "Printer" : "Printer belum terhubung"}</p>
                  <p className="text-xs text-muted-foreground">
                    {connected ? "Siap untuk mencetak" : "Ketuk untuk hubungkan printer"}
                  </p>
                </div>
              </div>
              <span
                className={`h-2.5 w-2.5 rounded-full ${connected ? "bg-success" : "bg-muted-foreground/40"}`}
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-5 grid grid-cols-2 gap-3"
        >
          <Link href="/history">
            <Card className="h-full">
              <CardContent className="flex flex-col gap-2 p-4">
                <History className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Riwayat</p>
                  <p className="text-xs text-muted-foreground">Resi tercetak</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/printer">
            <Card className="h-full">
              <CardContent className="flex flex-col gap-2 p-4">
                <PrinterIcon className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Printer</p>
                  <p className="text-xs text-muted-foreground">Kelola koneksi</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">File Terakhir</h2>
            <Link href="/history" className="text-xs font-medium text-primary">
              Lihat Semua
            </Link>
          </div>

          {items.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
                <FileText className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">Belum ada resi yang diproses</p>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="flex items-center gap-3 p-3">
                    <div className="h-12 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.croppedImageDataUrl}
                        alt={item.fileName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {SOURCE_LABEL[item.source] ?? item.source} · {formatDate(item.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        item.status === "printed"
                          ? "bg-primary-50 text-primary"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {item.status === "printed" ? "Tercetak" : "PDF"}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.section>
      </main>
    </>
  );
}
