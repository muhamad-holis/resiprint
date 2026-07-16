"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Printer as PrinterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { usePrintJobStore } from "@/store/print-job-store";
import { processImageForThermalPrint, applyMargins } from "@/lib/image-processing";
import { resizeCanvasToWidth } from "@/lib/crop";
import { getPrintWidthDots } from "@/lib/escpos";

export default function PrintPreviewPage() {
  const router = useRouter();
  const { croppedCanvas, adjustments, setAdjustments, paperSize } = usePrintJobStore();
  const previewRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!croppedCanvas) {
      router.replace("/preview");
    }
  }, [croppedCanvas, router]);

  useEffect(() => {
    if (!croppedCanvas || !previewRef.current) return;

    const widthDots = getPrintWidthDots(paperSize);
    const resized = resizeCanvasToWidth(croppedCanvas, widthDots);

    const clone = document.createElement("canvas");
    clone.width = resized.width;
    clone.height = resized.height;
    const ctx = clone.getContext("2d");
    ctx?.drawImage(resized, 0, 0);

    processImageForThermalPrint(clone, adjustments);
    const withMargins = applyMargins(clone, {
      top: adjustments.marginTop,
      bottom: adjustments.marginBottom,
      left: adjustments.marginLeft,
      right: adjustments.marginRight,
    });

    withMargins.style.width = "100%";
    withMargins.style.height = "auto";
    withMargins.style.imageRendering = "pixelated";
    previewRef.current.innerHTML = "";
    previewRef.current.appendChild(withMargins);
    setReady(true);
  }, [croppedCanvas, adjustments, paperSize]);

  return (
    <main className="safe-top flex min-h-dvh flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button onClick={() => router.back()} className="rounded-lg p-1.5 hover:bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-sm font-semibold">Preview Cetak</h1>
      </header>

      <div className="flex-1 overflow-auto px-4 py-4">
        <Card className="mb-4 overflow-hidden bg-neutral-100">
          <CardContent className="flex justify-center p-4">
            <div className="w-48 rounded border border-border bg-white p-1 shadow-soft" ref={previewRef} />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <SliderRow
            label="Brightness"
            value={adjustments.brightness}
            min={-100}
            max={100}
            onChange={(v) => setAdjustments({ brightness: v })}
          />
          <SliderRow
            label="Contrast"
            value={adjustments.contrast}
            min={-100}
            max={100}
            onChange={(v) => setAdjustments({ contrast: v })}
          />
          {!adjustments.dithering && (
            <SliderRow
              label="Threshold"
              value={adjustments.threshold}
              min={0}
              max={255}
              onChange={(v) => setAdjustments({ threshold: v })}
            />
          )}
          <SliderRow
            label="Margin Atas/Bawah"
            value={adjustments.marginTop}
            min={0}
            max={40}
            onChange={(v) => setAdjustments({ marginTop: v, marginBottom: v })}
          />

          <ToggleRow
            label="Dithering"
            description="Hasil lebih halus untuk gambar/foto"
            checked={adjustments.dithering}
            onChange={(v) => setAdjustments({ dithering: v })}
          />
          <ToggleRow
            label="Sharpen"
            description="Pertajam detail teks & barcode"
            checked={adjustments.sharpen}
            onChange={(v) => setAdjustments({ sharpen: v })}
          />
        </div>
      </div>

      <div className="safe-bottom border-t border-border px-4 py-3">
        <Button className="w-full" size="lg" onClick={() => router.push("/printer?from=print-preview")} disabled={!ready}>
          <PrinterIcon className="mr-1.5 h-4 w-4" />
          Lanjut ke Cetak
        </Button>
      </div>
    </main>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">{value}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={1} onValueChange={([v]) => onChange(v ?? 0)} />
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-secondary/60 px-3.5 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
