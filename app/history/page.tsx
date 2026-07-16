"use client";

import { useState } from "react";
import { Trash2, Printer as PrinterIcon, Download } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useHistoryStore } from "@/store/history-store";
import { usePrintJobStore } from "@/store/print-job-store";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const SOURCE_LABEL: Record<string, string> = {
  shopee: "Shopee",
  tokopedia: "Tokopedia",
  lazada: "Lazada",
  tiktokshop: "TikTok Shop",
  lainnya: "Lainnya",
};

export default function HistoryPage() {
  const router = useRouter();
  const items = useHistoryStore((s) => s.items);
  const removeItem = useHistoryStore((s) => s.removeItem);
  const { setCropRect, setCroppedCanvas, setAdjustments, setPaperSize } = usePrintJobStore();
  const [tab, setTab] = useState<"all" | "printed" | "saved">("all");

  const filtered = items.filter((it) => {
    if (tab === "all") return true;
    if (tab === "printed") return it.status === "printed";
    return it.status === "saved";
  });

  const handlePrintAgain = (item: (typeof items)[number]) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      setCroppedCanvas(canvas);
      setCropRect(item.cropRect);
      setAdjustments(item.adjustments);
      setPaperSize(item.paperSize);
      router.push("/print-preview");
    };
    img.src = item.croppedImageDataUrl;
  };

  const handleExport = (item: (typeof items)[number]) => {
    const link = document.createElement("a");
    link.href = item.croppedImageDataUrl;
    link.download = `${item.fileName.replace(/\.pdf$/i, "")}-resi.png`;
    link.click();
    toast.success("Gambar resi diunduh.");
  };

  return (
    <main className="safe-top mx-auto min-h-dvh max-w-[440px] px-4 pb-28 pt-6">
      <h1 className="mb-4 text-xl font-bold">Riwayat</h1>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="w-full">
          <TabsTrigger value="all">Semua</TabsTrigger>
          <TabsTrigger value="printed">Tercetak</TabsTrigger>
          <TabsTrigger value="saved">PDF</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="flex flex-col gap-2.5">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                Belum ada riwayat di kategori ini.
              </CardContent>
            </Card>
          ) : (
            filtered.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex gap-3 p-3">
                  <div className="h-16 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.croppedImageDataUrl} alt={item.fileName} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {SOURCE_LABEL[item.source] ?? item.source} · {formatDate(item.createdAt)}
                    </p>
                    <div className="mt-2 flex gap-1.5">
                      <button
                        onClick={() => handlePrintAgain(item)}
                        className="flex items-center gap-1 rounded-lg bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary"
                      >
                        <PrinterIcon className="h-3 w-3" />
                        Cetak Lagi
                      </button>
                      <button
                        onClick={() => handleExport(item)}
                        className="flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                      >
                        <Download className="h-3 w-3" />
                        Export
                      </button>
                      <button
                        onClick={() => {
                          removeItem(item.id);
                          toast.success("Item riwayat dihapus.");
                        }}
                        className="flex items-center gap-1 rounded-lg bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                        Hapus
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}
