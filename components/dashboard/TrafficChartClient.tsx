"use client";
import React from "react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";

const data = [
  { d: "Seg", meta: 680, google: 120, tiktok: 60 },
  { d: "Ter", meta: 720, google: 130, tiktok: 65 },
  { d: "Qua", meta: 700, google: 135, tiktok: 70 },
  { d: "Qui", meta: 690, google: 140, tiktok: 72 },
  { d: "Sex", meta: 760, google: 150, tiktok: 75 },
  { d: "Sáb", meta: 820, google: 165, tiktok: 78 },
  { d: "Dom", meta: 770, google: 155, tiktok: 70 },
];

export default function TrafficChartClient() {
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fff" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#fff" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,.08)" />
          <XAxis dataKey="d" tick={{ fill: "rgba(255,255,255,.6)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "rgba(255,255,255,.6)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "rgba(10,10,15,.95)",
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 12,
              color: "#fff"
            }}
          />
          <Area type="monotone" dataKey="google" stroke="#fff" fill="url(#g1)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
