import { CARD } from "@/lib/ui";
import { Activity, PlugZap, BarChart3 } from "lucide-react";
import TrafficChartClient from "@/components/dashboard/TrafficChartClient";

export default function TrackPage() {
  return (
    <div className="space-y-4">
      <header className={`${CARD} p-5`}>
        <div className="text-[12px] text-white/60">Produto • Métricas</div>
        <h1 className="text-xl font-semibold mt-1">Galaxify Track</h1>
        <p className="text-[13px] text-white/65 mt-1">
          Metrificação ponta a ponta com eventos idempotentes e dedupe.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-sm inline-flex items-center gap-2">
            <PlugZap className="w-4 h-4" /> Conectar CAPI
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-sm inline-flex items-center gap-2">
            <Activity className="w-4 h-4" /> Instalar Pixel
          </button>
          <button className="px-3 py-1.5 rounded-lg hover:bg-white/10 text-sm inline-flex items-center gap-2" aria-label="Ver eventos">
            <BarChart3 className="w-4 h-4" />
            <span className="sr-only">Ver eventos</span>
          </button>
        </div>
      </header>

      <section className={`${CARD} p-5 content-auto`}>
        <div className="text-sm font-medium">Tráfego por canal (7d)</div>
        <div className="mt-4 h-44">
          <TrafficChartClient />
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-4 content-auto">
        <div className={`${CARD} p-5`}>
          <div className="text-sm font-medium">Eventos recentes</div>
          <ul className="mt-3 space-y-2 text-[13px] text-white/75">
            <li>• <b>Purchase</b> — dedup OK — há 2min</li>
            <li>• <b>AddPaymentInfo</b> — via CAPI — há 6min</li>
            <li>• <b>ViewContent</b> — LP /alpha — há 11min</li>
          </ul>
        </div>
        <div className={`${CARD} p-5`}>
          <div className="text-sm font-medium">Status da integração</div>
          <ul className="mt-3 space-y-2 text-[13px] text-white/75">
            <li>• Meta Pixel — <span className="text-emerald-300/90">Operacional</span></li>
            <li>• Conversions API — <span className="text-emerald-300/90">Operacional</span></li>
            <li>• TikTok Events — <span className="text-yellow-300/90">Latência leve</span></li>
          </ul>
        </div>
      </section>
    </div>
  );
}
