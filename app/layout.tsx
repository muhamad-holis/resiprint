import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { AppShell } from "@/components/features/app-shell";
import "@/styles/globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ResiPrint — Cetak Resi Marketplace Lebih Mudah",
    template: "%s | ResiPrint",
  },
  description:
    "Cetak resi Shopee, Tokopedia, Lazada, dan TikTok Shop langsung dari HP ke printer thermal Bluetooth. Upload PDF, atur crop, cetak instan — 100% offline, tanpa server.",
  applicationName: "ResiPrint",
  keywords: [
    "cetak resi",
    "print label marketplace",
    "printer thermal bluetooth",
    "resi shopee",
    "resi tokopedia",
    "resi lazada",
    "resi tiktok shop",
    "aplikasi cetak resi android",
  ],
  authors: [{ name: "Produk Digital" }],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ResiPrint",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    title: "ResiPrint — Cetak Resi Marketplace Lebih Mudah",
    description:
      "Upload PDF resi, atur area crop, dan cetak langsung ke printer thermal Bluetooth. Offline, cepat, dan praktis.",
    siteName: "ResiPrint",
  },
  twitter: {
    card: "summary",
    title: "ResiPrint — Cetak Resi Marketplace Lebih Mudah",
    description: "Cetak resi marketplace ke printer thermal Bluetooth langsung dari HP.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3d6eff" },
    { media: "(prefers-color-scheme: dark)", color: "#151f52" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className={jakarta.variable}>
      <body className="min-h-dvh bg-background font-sans">
        <AppShell>{children}</AppShell>
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
