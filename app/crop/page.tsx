"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CropEditor } from "@/components/features/crop/crop-editor";
import { usePrintJobStore } from "@/store/print-job-store";
import { useCropPresetStore } from "@/store/crop-preset-store";
import { extractCroppedCanvas } from "@/lib/crop";
import type { CropRect } from "@/types";
import { toast } from "sonner";

export default function CropPage() {
  const router = useRouter();
  const { croppedCanvas, cropRect, setCropRect, setCroppedCanvas, paperSize } = usePrintJobStore();
  const [sourceCanvas, setSourceCanvas] = useState<HTMLCanvasElement | null>(null);
  // Canvas kerja terbaru dari editor (bisa berbeda dari sourceCanvas jika sudah diputar).
  const [workingCanvas, setWorkingCanvas] = useState<HTMLCanvasElement | null>(null);
  const [localRect, setLocalRect] = useState<CropRect>(
    cropRect ?? { x: 0.1, y: 0.08, width: 0.8, height: 0.35, rotation: 0 }
  );
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState("");
  const savePreset = useCropPresetStore((s) => s.savePreset);

  useEffect(() => {
    if (!croppedCanvas) {
      router.replace("/preview");
      return;
    }
    setSourceCanvas(croppedCanvas);
  }, [croppedCanvas, router]);

  const handleEditorChange = (rect: CropRect, canvas: HTMLCanvasElement) => {
    setLocalRect(rect);
    setWorkingCanvas(canvas);
  };

  const handleContinue = () => {
    const base = workingCanvas ?? croppedCanvas;
    if (!base) return;
    try {
      const result = extractCroppedCanvas(base, localRect);
      setCropRect(localRect);
      setCroppedCanvas(result);
      router.push("/print-preview");
    } catch {
      toast.error("Gagal memproses area crop.");
    }
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      toast.error("Nama preset tidak boleh kosong.");
      return;
    }
    savePreset(presetName.trim(), paperSize, localRect);
    toast.success("Preset crop tersimpan.");
    setSaveDialogOpen(false);
    setPresetName("");
  };

  if (!sourceCanvas) return null;

  return (
    <main className="safe-top flex min-h-dvh flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button onClick={() => router.back()} className="rounded-lg p-1.5 hover:bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-sm font-semibold">Edit &amp; Crop</h1>
        <button
          onClick={() => setSaveDialogOpen(true)}
          className="rounded-lg p-1.5 hover:bg-secondary"
          aria-label="Simpan preset crop"
        >
          <Save className="h-5 w-5" />
        </button>
      </header>

      <div className="flex-1 overflow-auto px-4 py-4">
        <CropEditor sourceCanvas={sourceCanvas} initialRect={localRect} onChange={handleEditorChange} />
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Geser untuk memindahkan, tarik titik biru untuk mengubah ukuran area crop
        </p>
      </div>

      <div className="safe-bottom border-t border-border px-4 py-3">
        <Button className="w-full" size="lg" onClick={handleContinue}>
          <Check className="mr-1.5 h-4 w-4" />
          Lanjutkan
        </Button>
      </div>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Simpan Preset Crop</DialogTitle>
            <DialogDescription>Simpan area crop ini agar bisa dipakai lagi nanti.</DialogDescription>
          </DialogHeader>
          <input
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="Contoh: Resi Shopee 58mm"
            className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <Button className="mt-3 w-full" onClick={handleSavePreset}>
            Simpan
          </Button>
        </DialogContent>
      </Dialog>
    </main>
  );
}
