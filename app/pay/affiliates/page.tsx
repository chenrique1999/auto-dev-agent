// app/pay/afiliados/page.tsx
"use client";
import React from "react";
import { CARD } from "@/lib/ui";

export default function AfiliadosPage() {
  return (
    // 👇 Wrapper de centralização
    <div className="mx-auto w-full max-w-6xl">
      <section className={`${CARD} p-5`}>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold mr-auto">Afiliados</h2>
          <button className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">
            Gerar link
          </button>
          <button className="rounded-xl bg-white text-gray-900 px-4 py-2 text-sm font-semibold hover:opacity-90">
            Criar programa
          </button>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className={`${CARD} p-5`}>
            <div className="text-sm text-white/70">Resumo</div>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-sm"><span>Afiliados ativos</span><b>0</b></div>
              <div className="flex justify-between text-sm"><span>Conversões (30d)</span><b>0</b></div>
              <div className="flex justify-between text-sm"><span>Receita (30d)</span><b>$ 0.00</b></div>
            </div>
          </div>

          <div className={`${CARD} p-5`}>
            <div className="text-sm text-white/70">Afiliados recentes</div>
            <div className="mt-3 text-sm text-white/70">Nenhum afiliado ainda.</div>
          </div>
        </div>
      </section>
    </div>
  );
}
