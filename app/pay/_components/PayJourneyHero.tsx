"use client";

import React from "react";
import { Rocket } from "lucide-react";

type Props = {
  value: number;      // acumulado (BRL)
  target?: number;    // meta (padrão 100K)
  className?: string; // passe "flex-1" para expandir
};

function formatBRL(n: number) {
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  });
}

export default function PayJourneyMini({
  value,
  target = 100_000,
  className = "",
}: Props) {
  const pctRaw = Math.max(0, Math.min(100, (Math.max(0, value) / target) * 100));
  // SSR-safe: na hidratação começamos em 0% e animamos
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const pct = mounted ? Number(pctRaw.toFixed(2)) : 0;

  return (
    <div
      className={
        "h-10 rounded-xl border border-white/10 bg-white/5 " +
        "px-3 flex items-center gap-3 min-w-[260px] " +
        className
      }
      title="Jornada: Terra → Lua 100K"
    >
      {/* Terra — look mais realista (shading + atmosfera + brilho especular) */}
      <svg width="20" height="20" viewBox="0 0 64 64" aria-hidden>
        <defs>
          <radialGradient id="skyGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(80,164,255,0.25)" />
            <stop offset="100%" stopColor="rgba(80,164,255,0)" />
          </radialGradient>
          <radialGradient id="earthBody" cx="45%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#9ad9ff" />
            <stop offset="100%" stopColor="#267ac0" />
          </radialGradient>
          <linearGradient id="oceans" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#49b0ff" />
            <stop offset="100%" stopColor="#1c6eae" />
          </linearGradient>
          <linearGradient id="land" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#91e879" />
            <stop offset="100%" stopColor="#4fbe70" />
          </linearGradient>
          {/* reflexo especular */}
          <radialGradient id="specular" cx="35%" cy="25%" r="25%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        {/* leve glow de céu atrás */}
        <circle cx="32" cy="32" r="28" fill="url(#skyGlow)" />

        {/* corpo do planeta */}
        <g transform="translate(32 32)">
          <circle r="22" fill="url(#earthBody)" />
          <circle r="20" fill="url(#oceans)" />
          {/* massas de terra (formas estilizadas, mas com cor de “mapa” realista) */}
          <path d="M -10,-2 C 4,-12 14,-8 18,0 C 12,4 6,7 -6,5 C -9,4 -11,1 -10,-2 Z" fill="url(#land)" />
          <path d="M -16,4 C -18,10 -10,13 -3,12 C -1,11 0,9 -3,6 C -6,4 -11,3 -16,4 Z" fill="url(#land)" opacity=".9" />
          <path d="M 4,10 C 10,9 15,12 13,15 C 9,17 5,16 3,14 C 2,13 2,11 4,10 Z" fill="url(#land)" opacity=".85" />
          {/* anel atmosférico + reflexo */}
          <circle r="20" fill="none" stroke="white" strokeOpacity=".14" strokeWidth="1.2" />
          <circle r="20" fill="url(#specular)" />
        </g>
      </svg>

      {/* Trilha com foguete — agora flex-1 para se estender até as pílulas */}
      <div className="relative h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-sky-400/70 via-indigo-400/70 to-fuchsia-400/70"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute -top-[7px] -translate-x-1/2"
          style={{ left: `calc(${pct}% + 0px)` }}
          aria-hidden
        >
          <div className="rounded-full bg-white/25 backdrop-blur p-[3px] shadow-[0_0_0_1px_rgba(255,255,255,0.25)]">
            <Rocket className="w-3 h-3 text-white/90" />
          </div>
        </div>
      </div>

      {/* Numeração compacta (SSR-safe: value pode mudar -> suprimir hydration warning do texto) */}
      <div className="text-xs text-white/85 whitespace-nowrap">
        <span suppressHydrationWarning>{formatBRL(value)}</span>
        <span className="text-white/60"> / {formatBRL(target)}</span>
      </div>
    </div>
  );
}
