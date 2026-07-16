"use client";

import { useCallback, useState } from "react";
import { bluetoothPrinterService, BluetoothPrinterError } from "@/services/bluetooth-printer.service";
import { buildPrintJob } from "@/lib/escpos";
import type { PrintStatus } from "@/types";
import { toast } from "sonner";

export function usePrint() {
  const [status, setStatus] = useState<PrintStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const print = useCallback(async (canvas: HTMLCanvasElement, copies: number) => {
    setError(null);

    if (!bluetoothPrinterService.isConnected()) {
      setStatus("error");
      const msg = "Printer belum terhubung. Sambungkan printer terlebih dahulu.";
      setError(msg);
      toast.error(msg);
      return false;
    }

    try {
      setStatus("printing");
      const job = buildPrintJob(canvas, copies, true);
      await bluetoothPrinterService.write(job);
      setStatus("success");
      toast.success("Berhasil mencetak resi.");
      return true;
    } catch (err) {
      setStatus("error");
      const msg =
        err instanceof BluetoothPrinterError
          ? err.message
          : "Gagal mencetak. Periksa koneksi printer dan coba lagi.";
      setError(msg);
      toast.error(msg);
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  return { status, error, print, reset };
}
