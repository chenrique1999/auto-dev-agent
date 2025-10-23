"use client";
import React from "react";
import { CARD } from "@/lib/ui";

type StatCardProps = {
  title: string;
  value: string;
  delta?: string;
  data?: number[];
};

function Sparkline({ data = [] }: { data?: number[] }) {
  const points = React.useMemo(() => {
    const s = Array.isArray(data) ? data : [];
    if (s.length === 0) return "";

    const w = 120, h = 24;
    const max = Math.max(...s);
    const min = Math.min(...s);
    const dx = s.length > 1 ? w / (s.length - 1) : w;

    return s
      .map((v, i) => {
        const x = i * dx;
        const y = h - ((v - min) / (max - min || 1)) * h;
        return `${x},${y}`;
      })
      .join(" ");
  }, [data]);

  return (
    <svg viewBox="0 0 120 24" className="w-full h-6">
      {points ? (
        <>
          <polyline points={points} fill="none" className="stroke-white/40" strokeWidth="2" />
          <polyline points={points} fill="none" className="stroke-white/25" strokeWidth="1" />
        </>
      ) : (
        <rect x="0" y="11" width="120" height="2" className="fill-white/10" />
      )}
    </svg>
  );
}

function StatCard({ title, value, delta, data = [] }: StatCardProps) {
  return (
    <div className={`${CARD} p-4`}>
      <div className="text-[12px] text-white/60">{title}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
      {delta && <div className="text-[12px] text-emerald-300/90">{delta}</div>}
      <div className="mt-2"><Sparkline data={data} /></div>
    </div>
  );
}

export default function StatCardGrid() {
  return (
    <div className="grid md:grid-cols-4 gap-3">
      <StatCard title="Sessões (7d)" value="12.8k" delta="+8%" data={[10, 11, 12, 13, 12, 13, 14]} />
      <StatCard title="Mensagens (24h)" value="58.4k" delta="+3%" data={[52, 53, 54, 56, 58, 57, 58]} />
      <StatCard title="Conversões" value="1.92k" delta="+5%" data={[1.1, 1.2, 1.3, 1.5, 1.7, 1.85, 1.92]} />
      <StatCard title="MRR (Pay)" value="R$ 37,4k" delta="+2%" data={[30, 31, 32, 33, 34, 36, 37]} />
    </div>
  );
}
