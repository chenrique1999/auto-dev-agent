// components/dashboard/ModulesGrid.tsx
"use client";
import React from "react";
import Link from "next/link";
import { CARD } from "@/lib/ui";
import { motion as Motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Activity, MessageSquare, FileText, CreditCard, Users, Settings } from "lucide-react";

type ModuleTile = {
  key: string;
  title: string;
  desc: string;
  icon: LucideIcon;
  status?: string; // ex: "Ativo"
  tag?: string;    // ex: "Em breve"
};

export default React.memo(function ModulesGrid() {
  const modules = React.useMemo<ModuleTile[]>(() => ([
    { key: "track", title: "Galaxify Track", desc: "Metrificação ponta a ponta", icon: Activity, status: "Ativo" },
    { key: "bot",   title: "Galaxify Bot",   desc: "Bot humanizado com IA",     icon: MessageSquare, status: "Ativo" },
    { key: "pages", title: "Galaxify Pages", desc: "LP drag-and-drop",          icon: FileText, status: "Ativo" },
  ]), []);

  const more = React.useMemo<ModuleTile[]>(() => ([
    { key: "pay",         title: "GalaxyFi Pay",        desc: "Links, checkout, assinaturas e cripto", icon: CreditCard, tag: "Em breve" },
    { key: "affiliates",  title: "GalaxyFi Affiliates", desc: "Afiliação com tracking nativo + split", icon: Users,     tag: "Em breve" },
    { key: "settings",    title: "Configurações",       desc: "Workspace, branding, integrações",      icon: Settings },
  ]), []);

  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const CardLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link
      href={href}
      aria-label={href.replace("/", "")}
      className="block focus:outline-none focus:ring-2 focus:ring-white/20 rounded-2xl"
    >
      {children}
    </Link>
  );

  const all: ModuleTile[] = React.useMemo(() => [...modules, ...more], [modules, more]);

  return (
    <div className="grid md:grid-cols-3 gap-3">
      {all.map((m) => {
        const Icon = m.icon;
        const href = "/" + m.key;
        return (
          <CardLink key={m.key} href={href}>
            <Motion.div
              whileHover={reduce ? undefined : { y: -2 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <div className={`${CARD} p-4`}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-white/80" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold truncate">{m.title}</div>
                      {m.status && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300/80">
                          {m.status}
                        </span>
                      )}
                      {m.tag && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                          {m.tag}
                        </span>
                      )}
                    </div>
                    <div className="text-[12px] text-white/65 mt-1">{m.desc}</div>
                  </div>
                </div>
              </div>
            </Motion.div>
          </CardLink>
        );
      })}
    </div>
  );
});
