import { chunkBytes } from "@/lib/escpos";

const PRINTER_SERVICE_UUIDS = [
  "000018f0-0000-1000-8000-00805f9b34fb",
  "0000ff00-0000-1000-8000-00805f9b34fb",
  "49535343-fe7d-4ae5-8fa9-9fafd205e455",
];

const WRITE_CHARACTERISTIC_UUIDS = [
  "00002af1-0000-1000-8000-00805f9b34fb",
  "0000ff02-0000-1000-8000-00805f9b34fb",
  "49535343-8841-43f4-a8d4-ecbe34729bb3",
];

export class BluetoothPrinterError extends Error {
  constructor(
    message: string,
    public code: "NOT_SUPPORTED" | "NO_DEVICE_SELECTED" | "CONNECTION_FAILED" | "WRITE_FAILED" | "NOT_CONNECTED"
  ) {
    super(message);
    this.name = "BluetoothPrinterError";
  }
}

type ConnectionListener = (connected: boolean, deviceName?: string) => void;

class BluetoothPrinterService {
  private device: BluetoothDevice | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private listeners: Set<ConnectionListener> = new Set();
  private reconnectAttempted = false;
  private manualDisconnect = false;

  isSupported(): boolean {
    return typeof navigator !== "undefined" && "bluetooth" in navigator;
  }

  onConnectionChange(listener: ConnectionListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(connected: boolean) {
    this.listeners.forEach((l) => l(connected, this.device?.name ?? undefined));
  }

  async scanAndConnect(): Promise<{ id: string; name: string }> {
    if (!this.isSupported()) {
      throw new BluetoothPrinterError(
        "Browser ini tidak mendukung Web Bluetooth API. Gunakan Chrome Android.",
        "NOT_SUPPORTED"
      );
    }

    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: PRINTER_SERVICE_UUIDS,
      });

      return await this.connectToDevice(device);
    } catch (err) {
      if (err instanceof DOMException && err.name === "NotFoundError") {
        throw new BluetoothPrinterError("Tidak ada printer yang dipilih.", "NO_DEVICE_SELECTED");
      }
      throw new BluetoothPrinterError(
        `Gagal memindai printer: ${err instanceof Error ? err.message : "unknown error"}`,
        "CONNECTION_FAILED"
      );
    }
  }

  private async connectToDevice(device: BluetoothDevice): Promise<{ id: string; name: string }> {
    try {
      this.device = device;
      device.addEventListener("gattserverdisconnected", this.handleDisconnect);

      const server = await device.gatt?.connect();
      if (!server) throw new Error("GATT server tidak tersedia");

      let foundCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;

      for (const serviceUuid of PRINTER_SERVICE_UUIDS) {
        try {
          const service = await server.getPrimaryService(serviceUuid);
          const characteristics = await service.getCharacteristics();
          const writable = characteristics.find(
            (c) => c.properties.write || c.properties.writeWithoutResponse
          );
          if (writable) {
            foundCharacteristic = writable;
            break;
          }
        } catch {
          continue;
        }
      }

      if (!foundCharacteristic) {
        for (const charUuid of WRITE_CHARACTERISTIC_UUIDS) {
          try {
            const services = await server.getPrimaryServices();
            for (const service of services) {
              const char = await service.getCharacteristic(charUuid).catch(() => null);
              if (char) {
                foundCharacteristic = char;
                break;
              }
            }
          } catch {
            continue;
          }
          if (foundCharacteristic) break;
        }
      }

      if (!foundCharacteristic) {
        throw new Error("Tidak ditemukan characteristic yang bisa ditulis pada printer ini");
      }

      this.characteristic = foundCharacteristic;
      this.reconnectAttempted = false;
      this.notifyListeners(true);

      if (device.id) {
        localStorage.setItem("resiprint:lastPrinterId", device.id);
        localStorage.setItem("resiprint:lastPrinterName", device.name ?? "Printer");
      }

      return { id: device.id, name: device.name ?? "Printer Bluetooth" };
    } catch (err) {
      this.notifyListeners(false);
      throw new BluetoothPrinterError(
        `Gagal terhubung ke printer: ${err instanceof Error ? err.message : "unknown error"}`,
        "CONNECTION_FAILED"
      );
    }
  }

  private handleDisconnect = async () => {
    this.characteristic = null;
    this.notifyListeners(false);

    if (this.manualDisconnect) {
      this.manualDisconnect = false;
      return;
    }

    const autoReconnect = localStorage.getItem("resiprint:autoReconnect") !== "false";
    if (autoReconnect && this.device && !this.reconnectAttempted) {
      this.reconnectAttempted = true;
      try {
        await new Promise((r) => setTimeout(r, 1500));
        await this.connectToDevice(this.device);
      } catch {
        // biarkan gagal senyap, user bisa reconnect manual dari UI
      }
    }
  };

  async disconnect(): Promise<void> {
    this.manualDisconnect = true;
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
    }
    this.characteristic = null;
    this.notifyListeners(false);
  }

  isConnected(): boolean {
    return !!this.characteristic && !!this.device?.gatt?.connected;
  }

  getDeviceName(): string | undefined {
    return this.device?.name ?? undefined;
  }

  async write(bytes: Uint8Array): Promise<void> {
    if (!this.characteristic) {
      throw new BluetoothPrinterError("Printer belum terhubung.", "NOT_CONNECTED");
    }
    try {
      const chunks = chunkBytes(bytes, 180);
      for (const chunk of chunks) {
        if (this.characteristic.properties.writeWithoutResponse) {
          await this.characteristic.writeValueWithoutResponse(chunk as BufferSource);
        } else {
          await this.characteristic.writeValue(chunk as BufferSource);
        }
        await new Promise((r) => setTimeout(r, 12));
      }
    } catch (err) {
      throw new BluetoothPrinterError(
        `Gagal mengirim data ke printer: ${err instanceof Error ? err.message : "unknown error"}`,
        "WRITE_FAILED"
      );
    }
  }
}

export const bluetoothPrinterService = new BluetoothPrinterService();
