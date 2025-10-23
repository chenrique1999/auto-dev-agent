"use client";

import { useMemo } from "react";
import {
  LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
} from "recharts";

type Point = { i: number; value: number };
export default function RevenueChart({ series }: { series: Point[] }) {
  const data = useMemo(
    () => series.map((p) => ({ name: String(p.i + 1), value: p.value })),
    [series]
  );

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-medium">Receita líquida</h2>
      </div>
      <div className="h-56">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.55)" }} />
            <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.55)" }} />
            <Tooltip
              contentStyle={{ background: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}
              labelStyle={{ color: "white" }}
              formatter={(v: number) => [
                new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v),
                "Receita",
              ]}
            />
            <Line type="monotone" dataKey="value" stroke="#a78bfa" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
