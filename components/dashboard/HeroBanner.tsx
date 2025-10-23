"use client";
import { ArrowRight, Sparkles } from "lucide-react";

export default function HeroBanner() {
  return (
    <section
      className="
        relative overflow-hidden rounded-2xl border border-white/10
        bg-gradient-to-br from-[#1a1441]/60 via-[#0b1a2a]/60 to-[#0a0a0f]/60
        p-6 md:p-7 lg:p-8
      "
    >
      {/* glows decorativos */}
      <div className="pointer-events-none absolute -left-14 -top-16 h-56 w-56 rounded-full bg-[#7c3aed]/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-12 -bottom-24 h-72 w-72 rounded-full bg-[#06b6d4]/25 blur-[90px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_0%,rgba(255,255,255,.08),transparent_60%)] opacity-30" />

      {/* conteúdo */}
      <div className="relative grid gap-6 md:grid-cols-[1fr,auto] md:items-start">
        <div>
          <div className="text-[12px] tracking-wide text-white/60 uppercase">
            Workspace: <span className="text-white/80">GALAXIFY</span> Labs
          </div>

          <div className="mt-1 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-white/80" />
            <h1 className="text-[22px] md:text-3xl font-bold tracking-tight">
              Um coração. Todos os seus funis.
            </h1>
          </div>

          <p className="mt-2 text-[13px] text-white/70 max-w-2xl">
            Ative métricas, bots e páginas em minutos. Painéis unificados, eventos idempotentes
            e escala de verdade.
          </p>

          {/* CTAs */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="
                inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium
                text-[#0a0a0f] bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500
                hover:opacity-95 transition
              "
            >
              Criar Projeto <ArrowRight className="w-4 h-4" />
            </button>

            <button className="rounded-lg px-3 py-1.5 text-sm bg-white/10 hover:bg-white/15">
              Ativar Bot
            </button>
            <button className="rounded-lg px-3 py-1.5 text-sm bg-white/10 hover:bg-white/15">
              Publicar LP
            </button>
            <button className="rounded-lg px-3 py-1.5 text-sm bg-white/10 hover:bg-white/15">
              Conectar CAPI
            </button>
          </div>
        </div>

        {/* “badge” decorativo à direita (só desktop) */}
        <div className="hidden md:block">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
            <div className="font-medium">GALAXIFY • Pay + Track + Bot</div>
            <div className="text-[12px] text-white/60">Seu stack unificado de conversão</div>
          </div>
        </div>
      </div>
    </section>
  );
}
