"use client";
import dynamic from "next/dynamic";
import ModulesGrid from "./ModulesGrid";
import StatCardGrid from "./StatCardGrid";
import { CARD } from "@/lib/ui";
import HeroBanner from "./HeroBanner";

const TrafficChartClient = dynamic(() => import("./TrafficChartClient"), { ssr: false });

export default function DashboardClient() {
  return (
    <div className="space-y-4">
      <HeroBanner />

      {/* ÚNICA seção de tráfego */}
      <section className={`${CARD} p-5 overflow-hidden`}>
        <div className="text-sm font-medium">Tráfego por canal (7d)</div>
        <div className="mt-4 h-56 md:h-64">
          <TrafficChartClient />
        </div>
      </section>

      <StatCardGrid />
      <ModulesGrid />
    </div>
  );
}
