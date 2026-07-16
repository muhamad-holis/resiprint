"use client";

import { useCallback, useEffect, useState } from "react";
import { bluetoothPrinterService, BluetoothPrinterError } from "@/services/bluetooth-printer.service";
import { useSettingsStore } from "@/store/settings-store";
import { toast } from "sonner";

export function usePrinterConnection() {
  const [connected, setConnected] = useState(false);
  const [deviceName, setDeviceName] = useState<string | undefined>(undefined);
  const [connecting, setConnecting] = useState(false);
  const autoReconnect = useSettingsStore((s) => s.autoReconnect);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  useEffect(() => {
    localStorage.setItem("resiprint:autoReconnect", String(autoReconnect));
  }, [autoReconnect]);

  useEffect(() => {
    setConnected(bluetoothPrinterService.isConnected());
    setDeviceName(bluetoothPrinterService.getDeviceName());

    const unsubscribe = bluetoothPrinterService.onConnectionChange((isConnected, name) => {
      setConnected(isConnected);
      setDeviceName(name);
      if (isConnected) {
        toast.success(`Terhubung ke ${name ?? "printer"}`);
      }
    });
    return unsubscribe;
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      const device = await bluetoothPrinterService.scanAndConnect();
      updateSettings({ lastPrinterId: device.id });
      return device;
    } catch (err) {
      if (err instanceof BluetoothPrinterError) {
        if (err.code !== "NO_DEVICE_SELECTED") {
          toast.error(err.message);
        }
      } else {
        toast.error("Terjadi kesalahan saat menghubungkan printer.");
      }
      throw err;
    } finally {
      setConnecting(false);
    }
  }, [updateSettings]);

  const disconnect = useCallback(async () => {
    await bluetoothPrinterService.disconnect();
    toast.info("Printer terputus.");
  }, []);

  return {
    connected,
    deviceName,
    connecting,
    connect,
    disconnect,
    isSupported: bluetoothPrinterService.isSupported(),
  };
}
