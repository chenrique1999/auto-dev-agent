// app/pay/_components/PayTabs.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

/**
 * ✅ PayShell neutro
 * Antes este wrapper aplicava max-w + padding (duplicando o container do RootLayout).
 * Agora é um passthrough, mantendo as margens/bordas no MESMO padrão das outras páginas.
 */
export function PayShell({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default function PayTabs() {
  const pathname = usePathname();

  const tabs = [
    { href: "/pay",              label: "Início" },
    { href: "/pay/sales",        label: "Vendas" },
    { href: "/pay/links",        label: "Links" },
    { href: "/pay/subscriptions",label: "Assinaturas" },
    { href: "/pay/affiliates",   label: "Afiliados" },
    { href: "/pay/members",      label: "Membros" },
    { href: "/pay/statement",    label: "Extrato" },
    { href: "/pay/withdraw",     label: "Saque" },
  ];

  const isActive = (href: string) => {
    if (href === "/pay") return pathname === "/pay";
    return pathname.startsWith(href);
  };

  return (
    <div
      className={clsx(
        "rounded-2xl border border-white/10 bg-white/5",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
      )}
    >
      {/* Barra superior com saudação pequena + tabs (scroll horizontal se precisar) */}
      <div className="flex items-center gap-2 px-2.5 py-2">
        <div className="shrink-0">
          <span className="px-3 py-1.5 text-sm text-white/80">
            Boa tarde, chefe.
          </span>
        </div>

        {/* tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition",
                isActive(t.href)
                  ? "bg-white/10 text-white"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              )}
            >
              {t.label}
            </Link>
          ))}

          {/* empurra o bloco da direita */}
          <div className="grow" />
        </div>

        {/* bloco de datas (quando tiver) */}
        <div className="hidden sm:flex items-center gap-1">
          <button className="px-2.5 py-1.5 rounded-md text-xs text-white/75 hover:bg-white/10">
            Hoje
          </button>
          <button className="px-2.5 py-1.5 rounded-md text-xs text-white/75 hover:bg-white/10">
            7 dias
          </button>
          <button className="px-2.5 py-1.5 rounded-md text-xs text-white/75 hover:bg-white/10">
            30 dias
          </button>
          <button className="px-2.5 py-1.5 rounded-md text-xs text-white/75 hover:bg-white/10">
            90 dias
          </button>
        </div>
      </div>
    </div>
  );
}
