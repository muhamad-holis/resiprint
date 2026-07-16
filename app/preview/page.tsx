"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePrintJobStore } from "@/store/print-job-store";
import { loadPdfDocument, renderPdfPageToCanvas } from "@/lib/pdf";
import { toast } from "sonner";
import type { PDFDocumentProxy } from "pdfjs-dist";

export default function PreviewPage() {
  const router = useRouter();
  const { pdfDataUrl, fileName, pageCount, currentPage, setCurrentPage, setCroppedCanvas } =
    usePrintJobStore();

  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pdfDataUrl) {
      router.replace("/");
      return;
    }
    loadPdfDocument(pdfDataUrl)
      .then(setPdfDoc)
      .catch(() => toast.error("Gagal memuat PDF."))
      .finally(() => setLoading(false));
  }, [pdfDataUrl, router]);

  useEffect(() => {
    if (!pdfDoc || !canvasContainerRef.current) return;
    let cancelled = false;

    renderPdfPageToCanvas(pdfDoc, currentPage + 1, 1.5).then((canvas) => {
      if (cancelled || !canvasContainerRef.current) return;
      canvasContainerRef.current.innerHTML = "";
      canvas.style.width = "100%";
      canvas.style.height = "auto";
      canvas.style.borderRadius = "12px";
      canvasContainerRef.current.appendChild(canvas);
    });

    return () => {
      cancelled = true;
    };
  }, [pdfDoc, currentPage]);

  const goToCrop = useCallback(async () => {
    if (!pdfDoc) return;
    try {
      const canvas = await renderPdfPageToCanvas(pdfDoc, currentPage + 1, 3);
      setCroppedCanvas(canvas);
      router.push("/crop");
    } catch {
      toast.error("Gagal memproses halaman.");
    }
  }, [pdfDoc, currentPage, setCroppedCanvas, router]);

  return (
    <main className="safe-top flex min-h-dvh flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button onClick={() => router.back()} className="rounded-lg p-1.5 hover:bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold">{fileName}</h1>
          <p className="text-xs text-muted-foreground">
            Halaman {currentPage + 1} dari {pageCount}
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => setZoom((z) => Math.min(3, z + 0.25))}>
          <ZoomIn className="h-4 w-4" />
        </Button>
      </header>

      <div className="flex-1 overflow-auto px-4 py-4">
        {loading ? (
          <Skeleton className="h-[70vh] w-full" />
        ) : (
          <div
            className="mx-auto max-w-md origin-top transition-transform"
            style={{ transform: `scale(${zoom})` }}
            ref={canvasContainerRef}
          />
        )}
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-4 border-t border-border px-4 py-3">
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === 0}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {currentPage + 1} / {pageCount}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === pageCount - 1}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="safe-bottom border-t border-border px-4 py-3">
        <Button className="w-full" size="lg" onClick={goToCrop} disabled={loading}>
          Lanjutkan ke Crop
        </Button>
      </div>
    </main>
  );
}
