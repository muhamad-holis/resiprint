"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/features/bottom-nav";

const HIDE_NAV_ROUTES = ["/preview", "/crop", "/print-preview"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNav = HIDE_NAV_ROUTES.some((route) => pathname?.startsWith(route));

  return (
    <>
      {children}
      {!hideNav && <BottomNav />}
    </>
  );
}
