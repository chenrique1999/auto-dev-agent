// app/pay/_components/PayHomeClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Greeting from "./Greeting";
import type { SaleRow } from "./RecentSalesTable";
import KpiGrid from "./KpiGrid";
import RevenueChart from "./RevenueChart";
import WalletCard from "./WalletCard";
import MethodsGrid from "./MethodsGrid";
import RecentSalesTable from "./RecentSalesTable";
import { PayShell } from "./PayTabs";

type RangeKey = "today" | "7d" | "30d" | "90d";

const RANGES: { key: RangeKey; label: string }[] = [
  { key: "today", label: "Hoje" },
  { key: "7d", label: "7 dias" },
  { key: "30d", label: "30 dias" },
  { key: "90d", label: "90 dias" },
];

export default function PayHomeClient() {
  const [mounted, setMounted] = useState(false);
  const [range, setRange] = useState<RangeKey>("30d");

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("pay.range") as RangeKey | null;
    if (saved && ["today", "7d", "30d", "90d"].includes(saved)) {
      setRange(saved);
    }
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem("pay.range", range);
  }, [mounted, range]);

  const mock = useMemo(() => buildMock(range), [range]);

  return (
    <PayShell>
      <div className="space-y-6">
        {/* Cabeçalho: saudação + seletor de período (mesmas bordas da Pay) */}
        <div className="flex items-center justify-between">
          <Greeting />
          <div className="flex items-center gap-1 rounded-xl bg-white/5 p-1">
            {RANGES.map((r) => {
              const active = r.key === range;
              return (
                <button
                  key={r.key}
                  onClick={() => setRange(r.key)}
                  className={`px-3 py-2 text-xs rounded-lg transition whitespace-nowrap ${
                    active ? "bg-white/10 font-medium" : "hover:bg-white/5"
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* KPIs principais */}
        <KpiGrid data={mock} />

        {/* Gráfico + Carteira */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 rounded-2xl bg-white/5 p-3">
            <RevenueChart series={mock.series} />
          </div>
          <WalletCard wallet={mock.wallet} />
        </div>

        {/* Meios de pagamento */}
        <MethodsGrid methods={mock.methods} />

        {/* Últimas vendas (removido max-w diferente para respeitar as bordas da Pay) */}
        <div className="rounded-2xl bg-white/5 p-3">
          <RecentSalesTable rows={mock.recentSales} />
        </div>
      </div>
    </PayShell>
  );
}

/** ===== Helpers / Mock ===== */

type MockData = {
  totals: {
    sales: number;
    boletos: number;
    refunds: number;
    commissions: number;
  };
  series: { i: number; value: number }[];
  wallet: { total: number; pending: number; available: number };
  methods: { name: string; percent: number }[];
  recentSales: SaleRow[];
};

function buildMock(range: RangeKey): MockData {
  const points = range === "today" ? 8 : range === "7d" ? 7 : range === "30d" ? 30 : 90;

  const series = Array.from({ length: points }).map((_, i) => {
    const base = 200 + Math.sin(i / 3) * 80 + (i % 5) * 25;
    const value = Math.max(0, Math.round(base + (Math.random() - 0.5) * 40));
    return { i, value };
  });

  const total = series.reduce((s, p) => s + p.value, 0);
  const boletos = Math.round(total * 0.18);
  const refunds = Math.round(total * 0.012);
  const commissions = Math.round(total * 0.045);

  const wallet = {
    total: Math.round(total * 0.003) / 100,
    pending: 0,
    available: Math.round(total * 0.003) / 100,
  };

  const methods = [
    { name: "Cartão de crédito", percent: 72 },
    { name: "PIX", percent: 21 },
    { name: "Boleto", percent: 6 },
    { name: "PicPay", percent: 1 },
  ];

  const recentSales: SaleRow[] = [
    { id: "#A9F1", product: "Vivendo de IA", buyer: "Bruna M.", amount: 19.9, status: "Aprovado", method: "Pix" },
    { id: "#A9E7", product: "Clipador Pro", buyer: "Leo S.", amount: 97.0, status: "Aprovado", method: "Crédito" },
    { id: "#A9D8", product: "Paquera Hot", buyer: "Marina R.", amount: 29.9, status: "Pendente", method: "Boleto" },
  ];

  return {
    totals: { sales: total, boletos, refunds, commissions },
    series,
    wallet,
    methods,
    recentSales,
  };
}
