// components/Sidebar.tsx
"use client";

import React, { memo, useMemo } from "react";
import { usePathname } from "next/navigation";
import NavLink from "@/components/NavLink";
import LogoGALAXIFY from "@/components/icons/LogoGALAXIFY";
import {
  LayoutDashboard,
  CreditCard,
  Activity,
  Bot,
  FileText,
  Users,
  ShoppingBag,
  Settings,
} from "lucide-react";

type Item = { href: string; label: string; icon: React.ReactNode };

function Links({ isActive }: { isActive: (href: string) => boolean }) {
  const items: Item[] = useMemo(
    () => [
      { href: "/",             label: "Dashboard",            icon: <LayoutDashboard className="w-4 h-4" /> },
      { href: "/pay",          label: "Galaxify Pay",         icon: <CreditCard className="w-4 h-4" /> },
      { href: "/track",        label: "Galaxify Track",       icon: <Activity className="w-4 h-4" /> },
      { href: "/bot",          label: "Galaxify Bot",         icon: <Bot className="w-4 h-4" /> },
      { href: "/pages",        label: "Galaxify Pages",       icon: <FileText className="w-4 h-4" /> },
      { href: "/affiliates",   label: "Galaxify Affiliates",  icon: <Users className="w-4 h-4" /> },
      { href: "/marketplace",  label: "Galaxify Marketplace", icon: <ShoppingBag className="w-4 h-4" /> },
      { href: "/settings",     label: "Configurações",        icon: <Settings className="w-4 h-4" /> },
    ],
    []
  );

  return (
    <nav className="rounded-2xl bg-white/5 p-2 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] backdrop-blur">
      {/* Logo com mais “respiro” em cima e abaixo */}
      <div className="grid place-items-center pt-6 pb-4 md:pt-7 md:pb-4 mb-3 md:mb-4">
        <LogoGALAXIFY className="text-[26px] md:text-[30px]" glow />
      </div>

      {items.map((it) => (
        <NavLink
          key={it.href}
          href={it.href}
          aria-current={isActive(it.href) ? "page" : false}
          className={
            "mb-1 flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition " +
            (isActive(it.href)
              ? "bg-white/10 text-white"
              : "text-white/80 hover:bg-white/10 hover:text-white")
          }
        >
          <span className="grid place-items-center">{it.icon}</span>
          <span>{it.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

function SidebarInner() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* Fixo no desktop, mesma posição/largura de antes */}
      <div
        className="
          fixed top-1/2 -translate-y-1/2
          left-[clamp(28px,5vw,70px)]
          z-30 hidden lg:block
        "
      >
        <div className="w-[260px]">
          <Links isActive={isActive} />
        </div>
      </div>

      {/* Mobile/SM: inline, com a mesma logo e espaçamentos */}
      <div className="lg:hidden">
        <div className="w-[260px] max-w-full">
          <Links isActive={isActive} />
        </div>
      </div>
    </>
  );
}

const Sidebar = memo(SidebarInner);
export default Sidebar;
