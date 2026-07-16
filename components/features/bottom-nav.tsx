"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, History, Printer, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/history", label: "Riwayat", icon: History },
  { href: "/printer", label: "Printer", icon: Printer },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[440px] items-stretch justify-around px-2 py-1.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1.5 transition-colors"
              aria-current={active ? "page" : undefined}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
                strokeWidth={active ? 2.4 : 2}
              />
              <span
                className={cn(
                  "text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
