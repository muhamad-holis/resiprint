"use client";

import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { BottomNav } from "@/components/features/bottom-nav";
import { ThemeApplier } from "@/components/features/theme-applier";

const HIDE_NAV_ROUTES = ["/preview", "/crop", "/print-preview"];

function AppShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isPrinterFlow = pathname === "/printer" && searchParams.get("from") === "print-preview";
  const hideNav = HIDE_NAV_ROUTES.some((route) => pathname?.startsWith(route)) || isPrinterFlow;

  return (
    <>
      <ThemeApplier />
      {children}
      {!hideNav && <BottomNav />}
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={children}>
      <AppShellInner>{children}</AppShellInner>
    </Suspense>
  );
}
