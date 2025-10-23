"use client";
import React from "react";
import { CARD } from "@/lib/ui";
import { Users, Trophy, Link2 } from "lucide-react";

export default function AffiliatesPage() {
  return (
    <div className="space-y-4">
      <header className={`${CARD} p-5`}>
        <div className="text-[12px] text-white/60">Afiliação</div>
        <h1 className="text-xl font-semibold mt-1">GalaxyFi Affiliates <span className="text-[12px] ml-2 px-2 py-0.5 rounded-full bg-white/10 text-white/70 align-middle">Em breve</span></h1>
        <p className="text-[13px] text-white/65 mt-1">Programa de afiliação com split e tracking nativo.</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-sm inline-flex items-center gap-2"><Users className="w-4 h-4" /> Criar programa</button>
          <button className="px-3 py-1.5 rounded-lg hover:bg-white/10 text-sm inline-flex items-center gap-2"><Link2 className="w-4 h-4" /> Gerar link</button>
          <button className="px-3 py-1.5 rounded-lg hover:bg-white/10 text-sm inline-flex items-center gap-2"><Trophy className="w-4 h-4" /> Ranking</button>
        </div>
      </header>

      <section className={`grid md:grid-cols-2 gap-4`}>
        <div className={`${CARD} p-5`}>
          <div className="text-sm font-medium">Resumo</div>
          <ul className="mt-3 space-y-2 text-[13px] text-white/75">
            <li>• Afiliados ativos — 0</li>
            <li>• Conversões (30d) — 0</li>
          </ul>
        </div>
        <div className={`${CARD} p-5`}>
          <div className="text-sm font-medium">Afiliados recentes</div>
          <div className="mt-3 text-[13px] text-white/65">Nenhum afiliado ainda.</div>
        </div>
      </section>
    </div>
  );
}
