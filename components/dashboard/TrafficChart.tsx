// components/dashboard/TrafficChart.tsx
"use client";
import React from "react";
import { CARD } from "@/lib/ui";
import {
  ResponsiveContainer, AreaChart, Area, Line, XAxis, YAxis, Tooltip,
} from "@/components/charts/RechartsClient";

function Dot({ color = "#ffffff" }) {
  return <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />;
}

export default React.memo(function TrafficChart({ data }: { data: any[] }) {
  return (
    <div className={`${CARD} p-5`}>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[12px] text-white/60">Tráfego por canal (7d)</div>
          <div className="text-sm font-semibold">Meta • Google • TikTok</div>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-white/60">
          <div className="flex items-center gap-1"><Dot color="#ffffff"/> Meta</div>
          <div className="flex items-center gap-1"><Dot color="#bbbbbb"/> Google</div>
          <div className="flex items-center gap-1"><Dot color="#888888"/> TikTok</div>
        </div>
      </div>

      <div className="mt-4 h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#ffffff" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="d" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} width={28}/>
            <Tooltip
              contentStyle={{ background: "#141414", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, fontSize: 12 }}
              labelStyle={{ color: "#d1d5db" }}
            />
            <Area type="monotone" dataKey="meta" stroke="#ffffff" fill="url(#g1)" strokeWidth={1.2}/>
            <Line type="monotone" dataKey="google" stroke="#ffffff" strokeOpacity={0.45} strokeWidth={1} dot={false}/>
            <Line type="monotone" dataKey="tiktok" stroke="#ffffff" strokeOpacity={0.25} strokeWidth={1} dot={false}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
