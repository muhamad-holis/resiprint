"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Bluetooth, CheckCircle2, Loader2, Minus, Plus, Printer as PrinterIcon, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePrinterConnection } from "@/hooks/use-printer-connection";
import { usePrint } from "@/hooks/use-print";
import { usePrintJobStore } from "@/store/print-job-store";
import { useHistoryStore } from "@/store/history-store";
import { useSettingsStore } from "@/store/settings-store";
import type { PaperSize } from "@/types";

export default function PrinterPage() {
  return (
    <Suspense fallback={null}>
      <PrinterPageContent />
    </Suspense>
  );
}

function PrinterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromPrintPreview = searchParams.get("from") === "print-preview";

  const { connected, deviceName, connecting, connect, disconnect, isSupported } = usePrinterConnection();
  const { status, print, reset } = usePrint();
  const { croppedCanvas, fileName, source, cropRect, adjustments } = usePrintJobStore();
  const addHistoryItem = useHistoryStore((s) => s.addItem);
  const paperSize = useSettingsStore((s) => s.defaultPaperSize);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const [copies, setCopies] = useState(1);

  const handleScan = async () => {
    try {
      await connect();
    } catch {
      // error sudah ditoast di dalam hook
    }
  };

  const handlePrint = async () => {
    if (!croppedCanvas) return;
    reset();
    const success = await print(croppedCanvas, copies);

    addHistoryItem({
      fileName: fileName ?? "resi.pdf",
      source,
      pdfDataUrl: "",
      croppedImageDataUrl: croppedCanvas.toDataURL("image/png"),
      pageIndex: 0,
      cropRect: cropRect ?? { x: 0, y: 0, width: 1, height: 1, rotation: 0 },
      adjustments,
      paperSize,
      status: success ? "printed" : "failed",
      printedAt: success ? Date.now() : undefined,
      copies,
    });
  };

  return (
    <main className="safe-top flex min-h-dvh flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button onClick={() => router.back()} className="rounded-lg p-1.5 hover:bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-sm font-semibold">Printer</h1>
      </header>

      <div className="flex-1 overflow-auto px-4 py-4">
        {!isSupported && (
          <Card className="mb-4 border-warning/40 bg-warning/5">
            <CardContent className="p-4 text-sm text-warning-foreground">
              Browser ini tidak mendukung Web Bluetooth. Gunakan Google Chrome di Android untuk fitur cetak.
            </CardContent>
          </Card>
        )}

        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Pilih Printer Bluetooth</h2>
          <button onClick={handleScan} className="rounded-lg p-1.5 hover:bg-secondary" aria-label="Scan ulang">
            <RefreshCw className={`h-4 w-4 ${connecting ? "animate-spin" : ""}`} />
          </button>
        </div>

        <Card className="mb-5">
          <CardContent className="p-4">
            <button
              onClick={connected ? disconnect : handleScan}
              disabled={connecting || !isSupported}
              className="flex w-full items-center gap-3"
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  connected ? "bg-primary-50 text-primary" : "bg-secondary text-muted-foreground"
                }`}
              >
                {connecting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Bluetooth className="h-5 w-5" />}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">
                  {connected ? deviceName ?? "Printer" : connecting ? "Menghubungkan..." : "Cari & Hubungkan Printer"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {connected ? "Terhubung — ketuk untuk putuskan" : "Ketuk untuk memindai printer di sekitar"}
                </p>
              </div>
              <span className={`h-2.5 w-2.5 rounded-full ${connected ? "bg-success" : "bg-muted-foreground/40"}`} />
            </button>
          </CardContent>
        </Card>

        <h2 className="mb-2 text-sm font-semibold">Pengaturan Cetak</h2>
        <Card className="mb-5">
          <CardContent className="flex flex-col divide-y divide-border p-0">
            <div className="flex items-center justify-between px-4 py-3.5">
              <span className="text-sm font-medium">Ukuran Kertas</span>
              <div className="flex gap-1.5">
                {(["58mm", "80mm"] as PaperSize[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => updateSettings({ defaultPaperSize: size })}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      paperSize === size ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3.5">
              <span className="text-sm font-medium">Jumlah Salinan</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCopies((c) => Math.max(1, c - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-4 text-center text-sm font-semibold">{copies}</span>
                <button
                  onClick={() => setCopies((c) => Math.min(20, c + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {status === "success" && (
          <Card className="mb-5 border-success/30 bg-success/5">
            <CardContent className="flex items-center gap-3 p-4">
              <CheckCircle2 className="h-6 w-6 text-success" />
              <div>
                <p className="text-sm font-semibold">Berhasil mencetak</p>
                <p className="text-xs text-muted-foreground">Resi telah dikirim ke printer.</p>
              </div>
            </CardContent>
          </Card>
        )}
        {status === "error" && (
          <Card className="mb-5 border-destructive/30 bg-destructive/5">
            <CardContent className="flex items-center gap-3 p-4">
              <XCircle className="h-6 w-6 text-destructive" />
              <div>
                <p className="text-sm font-semibold">Gagal mencetak</p>
                <p className="text-xs text-muted-foreground">Periksa koneksi printer dan coba lagi.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {fromPrintPreview && croppedCanvas && (
        <div className="safe-bottom flex gap-2 border-t border-border px-4 py-3">
          <Button
            className="flex-1"
            size="lg"
            variant={status === "success" ? "secondary" : "default"}
            onClick={handlePrint}
            disabled={!connected || status === "printing"}
          >
            {status === "printing" ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <PrinterIcon className="mr-1.5 h-4 w-4" />
            )}
            {status === "printing" ? "Mencetak..." : status === "success" ? "Cetak Lagi" : "Cetak Sekarang"}
          </Button>
        </div>
      )}
    </main>
  );
}
