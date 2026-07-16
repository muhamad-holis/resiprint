"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FileUp, Loader2, UploadCloud } from "lucide-react";
import { Card } from "@/components/ui/card";
import { fileToDataUrl, loadPdfDocument } from "@/lib/pdf";
import { usePrintJobStore } from "@/store/print-job-store";
import { toast } from "sonner";

const MAX_FILE_SIZE_MB = 20;

export function UploadCard() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setDragging] = useState(false);
  const [isProcessing, setProcessing] = useState(false);
  const setPdf = usePrintJobStore((s) => s.setPdf);

  const handleFile = useCallback(
    async (file: File) => {
      if (file.type !== "application/pdf") {
        toast.error("File harus berformat PDF.");
        return;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast.error(`Ukuran file maksimal ${MAX_FILE_SIZE_MB}MB.`);
        return;
      }

      setProcessing(true);
      try {
        const dataUrl = await fileToDataUrl(file);
        const pdfDoc = await loadPdfDocument(dataUrl);
        setPdf(file.name, dataUrl, pdfDoc.numPages);
        router.push("/preview");
      } catch {
        toast.error("Gagal membaca file PDF. Pastikan file tidak rusak.");
      } finally {
        setProcessing(false);
      }
    },
    [router, setPdf]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) void handleFile(file);
    },
    [handleFile]
  );

  return (
    <Card
      className="relative overflow-hidden border-2 border-dashed p-0 transition-colors data-[dragging=true]:border-primary data-[dragging=true]:bg-primary-50"
      data-dragging={isDragging}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isProcessing}
        className="flex w-full flex-col items-center gap-3 px-6 py-10 text-center"
      >
        <motion.div
          animate={isDragging ? { scale: 1.08 } : { scale: 1 }}
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-soft"
        >
          {isProcessing ? (
            <Loader2 className="h-7 w-7 animate-spin" />
          ) : (
            <UploadCloud className="h-7 w-7" />
          )}
        </motion.div>
        <div>
          <p className="font-semibold text-foreground">
            {isProcessing ? "Memproses PDF..." : "Upload PDF Resi"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tarik &amp; letakkan file, atau ketuk untuk pilih dari perangkat
          </p>
        </div>
        <div className="mt-1 flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
          <FileUp className="h-3.5 w-3.5" />
          Pilih File PDF
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
    </Card>
  );
}
