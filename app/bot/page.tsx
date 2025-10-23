"use client";
import React from "react";
import { CARD } from "@/lib/ui";
import { MessageSquarePlus, Workflow, Bot } from "lucide-react";

export default function BotPage() {
  return (
    <div className="space-y-4">
      <header className={`${CARD} p-5`}>
        <div className="text-[12px] text-white/60">Atendimento • Fluxos</div>
        <h1 className="text-xl font-semibold mt-1">Galaxify Bot</h1>
        <p className="text-[13px] text-white/65 mt-1">Fluxos humanizados, templates e integrações WA/Meta.</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-sm inline-flex items-center gap-2">
            <MessageSquarePlus className="w-4 h-4" /> Criar fluxo
          </button>
          <button className="px-3 py-1.5 rounded-lg hover:bg-white/10 text-sm inline-flex items-center gap-2">
            <Workflow className="w-4 h-4" /> Templates
          </button>
          <button className="px-3 py-1.5 rounded-lg hover:bg-white/10 text-sm inline-flex items-center gap-2">
            <Bot className="w-4 h-4" /> Configurar WhatsApp
          </button>
        </div>
      </header>

      <section className={`grid md:grid-cols-2 gap-4`}>
        <div className={`${CARD} p-5`}>
          <div className="text-sm font-medium">Fluxos ativos</div>
          <ul className="mt-3 space-y-2 text-[13px] text-white/75">
            <li>• Abertura v2 — 14 nós — Atualizado hoje 16:03</li>
            <li>• Confirmação — 9 nós — Atualizado ontem 21:10</li>
          </ul>
        </div>
        <div className={`${CARD} p-5`}>
          <div className="text-sm font-medium">Atividade recente</div>
          <ul className="mt-3 space-y-2 text-[13px] text-white/75">
            <li>• Webhook ManyChat conectado — há 2min</li>
            <li>• Novo lead (CTWA) — há 5min</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
