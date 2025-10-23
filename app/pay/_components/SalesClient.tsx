"use client";

import { useMemo, useState } from "react";
import SalesFilters, { FiltersState } from "./SalesFilters";
import SalesTable, { Sale as SaleBase } from "./SalesTable";
import SaleDrawer from "./SaleDrawer";

/** Estende o Sale base com campos usados no UI/mocks */
type UISale = SaleBase & {
  buyerStats?: {
    purchases?: number;
    firstBuyAt?: string;
    lastBuyAt?: string;
    ltv?: number;
    chargebacks?: number;
  };
  utm?: { source?: string; medium?: string; campaign?: string };
  device?: { os?: string; browser?: string };
  geo?: { country?: string; city?: string };
};

type Range = "today" | "7d" | "30d" | "90d";

const RANGES: { key: Range; label: string }[] = [
  { key: "today", label: "Hoje" },
  { key: "7d", label: "7 dias" },
  { key: "30d", label: "30 dias" },
  { key: "90d", label: "90 dias" },
];

export default function SalesClient() {
  const [range, setRange] = useState<Range>("30d");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<FiltersState>({});
  const [selected, setSelected] = useState<SaleBase | null>(null);

  // MOCK (trocar por API quando integrar)
  const dataset: UISale[] = useMemo(() => buildMock(range), [range]);

  // Busca + filtros
  const rows: UISale[] = useMemo(() => {
    const q = query.trim().toLowerCase();

    return dataset.filter((s) => {
      const hay = [
        s.id,
        s.product,
        s.offer ?? "",
        s.buyer.name,
        s.buyer.email ?? "",
        s.buyer.phone ?? "",
        s.affiliate?.email ?? "",
        s.affiliate?.id ?? "",
        s.coupon ?? "",
        s.transaction?.code ?? "",
        s.transaction?.ip ?? "",
      ].join(" ").toLowerCase();
      if (q && !hay.includes(q)) return false;

      if (filters.dateStart && new Date(s.date) < new Date(filters.dateStart)) return false;
      if (filters.dateEnd && new Date(s.date) > new Date(`${filters.dateEnd}T23:59:59`)) return false;
      if (filters.product && s.product !== filters.product) return false;
      if (filters.offer && s.offer !== filters.offer) return false;
      if (filters.method?.length && !filters.method.includes(s.method)) return false;
      if (filters.status?.length && !filters.status.includes(s.status)) return false;
      if (filters.sellerType && s.sellerType !== filters.sellerType) return false;
      if (filters.customerEmail && s.buyer.email?.toLowerCase() !== filters.customerEmail.toLowerCase()) return false;
      if (
        filters.customerPhone &&
        (s.buyer.phone || "").replace(/\D/g, "") !== filters.customerPhone.replace(/\D/g, "")
      ) return false;
      if (filters.affiliateEmail && s.affiliate?.email?.toLowerCase() !== filters.affiliateEmail.toLowerCase())
        return false;
      if (filters.affiliateId && (s.affiliate?.id || "").toLowerCase() !== filters.affiliateId.toLowerCase())
        return false;
      if (filters.coupon && (s.coupon || "").toLowerCase() !== filters.coupon.toLowerCase()) return false;

      return true;
    });
  }, [dataset, query, filters]);

  // KPIs
  const kpis = useMemo(() => {
    const approved = rows.filter((r) => r.status === "Aprovada");
    const refunded = rows.filter((r) => r.status === "Estornada");
    const faturamento = approved.reduce((s, r) => s + r.amount, 0);
    const estornos = refunded.reduce((s, r) => s + r.amount, 0);
    return { faturamento, receitaLiquida: faturamento - estornos, totalVendas: rows.length };
  }, [rows]);

  // Export CSV
  const exportCSV = () => {
    const header = ["id", "data", "valor", "moeda", "metodo", "status", "produto", "oferta", "cliente", "email", "telefone"];
    const lines = rows.map((r) =>
      [
        r.id,
        new Date(r.date).toISOString(),
        r.amount.toFixed(2).replace(".", ","),
        r.currency,
        r.method,
        r.status,
        r.product,
        r.offer || "",
        r.buyer.name,
        r.buyer.email || "",
        r.buyer.phone || "",
      ].map((s) => `"${String(s).replace(/"/g, '""')}"`).join(","),
    );
    const blob = new Blob([header.join(",") + "\n" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "vendas.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <section className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-3">
        <Kpi title="Faturamento" value={toBRL(kpis.faturamento)} />
        <Kpi title="Receita líquida" value={toBRL(kpis.receitaLiquida)} />
        <Kpi title="Total de vendas" value={String(kpis.totalVendas)} />
      </section>

      {/* Ações */}
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 md:flex-row md:justify-center">
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl bg-white/5 p-1">
            {RANGES.map((r) => {
              const active = range === r.key;
              return (
                <button
                  key={r.key}
                  onClick={() => setRange(r.key)}
                  className={`rounded-lg px-3 py-1.5 text-xs ${active ? "bg-white/10 font-medium" : "hover:bg-white/5"}`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>

          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por CPF, ID, e-mail, nome..."
              className="w-72 rounded-xl bg-white/5 px-3 py-2 text-sm outline-none placeholder:text-white/40 focus:bg-white/10"
            />
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white/40">
              ⌘K
            </span>
          </div>

          <SalesFilters value={filters} onChange={setFilters} dataset={dataset} />
        </div>

        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="rounded-xl bg-white/5 px-3 py-2 text-sm transition hover:bg-white/10">
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="mx-auto max-w-6xl rounded-2xl bg-white/5 p-2">
        <SalesTable rows={rows} onRowClick={setSelected} />
      </div>

      {/* Drawer */}
      <SaleDrawer sale={(selected as UISale | null)} onClose={() => setSelected(null)} />
    </div>
  );
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/5 p-3 text-center">
      <p className="text-xs text-white/60">{title}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function toBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

/* ================= Mock (trocar por API) ================ */

function buildMock(range: Range): UISale[] {
  const now = new Date();
  const isoDaysAgo = (n: number) => {
    const d = new Date(now); d.setDate(d.getDate() - n); return d.toISOString();
  };

  const base: UISale[] = [
    {
      id: "#APV-1023",
      date: isoDaysAgo(1),
      amount: 97.0,
      currency: "BRL",
      method: "Pix",
      status: "Aprovada",
      product: "Clipador Pro",
      offer: "Plano Mensal",
      sellerType: "Autoral",
      buyer: { name: "Luana S.", email: "luana@example.com", phone: "+55 11 90000-0000" },
      buyerStats: { purchases: 3, firstBuyAt: isoDaysAgo(120), lastBuyAt: isoDaysAgo(1), ltv: 291, chargebacks: 0 },
      transaction: { code: "ord_1023", ip: "177.22.11.9" },
      utm: { source: "meta", medium: "cpc", campaign: "abril_conv" },
      device: { os: "Android", browser: "Chrome" },
      geo: { country: "BR", city: "São Paulo" },
    },
    {
      id: "#PND-0931",
      date: isoDaysAgo(2),
      amount: 29.9,
      currency: "BRL",
      method: "Boleto",
      status: "Pendente",
      product: "Paquera Hot",
      offer: "Curso",
      sellerType: "Autoral",
      buyer: { name: "Marina R.", email: "marina@example.com", phone: "+55 21 98888-0000" },
      buyerStats: { purchases: 1, firstBuyAt: isoDaysAgo(2), lastBuyAt: isoDaysAgo(2), ltv: 0, chargebacks: 0 },
      transaction: { code: "ord_0931", ip: "170.1.1.1" },
      utm: { source: "google", medium: "search", campaign: "brand" },
      device: { os: "Windows", browser: "Edge" },
      geo: { country: "BR", city: "Rio de Janeiro" },
    },
    {
      id: "#CNL-0844",
      date: isoDaysAgo(3),
      amount: 197.0,
      currency: "USD",
      method: "Crédito",
      status: "Cancelada",
      product: "Vivendo de IA",
      offer: "Lançamento",
      sellerType: "Afiliação",
      buyer: { name: "Bruna M.", email: "bruna@example.com" },
      buyerStats: { purchases: 5, firstBuyAt: isoDaysAgo(300), lastBuyAt: isoDaysAgo(3), ltv: 540, chargebacks: 1 },
      affiliate: { id: "af_888", email: "x@afiliado.com" },
      coupon: "NEW10",
      transaction: { code: "ord_0844", ip: "189.10.10.2" },
      utm: { source: "tiktok", medium: "cpc", campaign: "topo_funil" },
      device: { os: "iOS", browser: "Safari" },
      geo: { country: "US", city: "Miami" },
    },
    {
      id: "#EST-0712",
      date: isoDaysAgo(4),
      amount: 17.41,
      currency: "BRL",
      method: "Pix",
      status: "Estornada",
      product: "Discord do Ruyter",
      offer: "Curso",
      sellerType: "Coprodução",
      buyer: { name: "Claudia C.", email: "clauzasc@gmail.com", phone: "+55 48 99168-7014" },
      buyerStats: { purchases: 2, firstBuyAt: isoDaysAgo(200), lastBuyAt: isoDaysAgo(4), ltv: 35.0, chargebacks: 1 },
      affiliate: { id: "af_001", email: "afiliado@dominio.com" },
      transaction: { code: "TPP4E...", ip: "132.255.57.242" },
      utm: { source: "email", medium: "newsletter", campaign: "abril" },
      device: { os: "Android", browser: "Chrome" },
      geo: { country: "BR", city: "Florianópolis" },
    },
  ];

  const start = new Date(now);
  const map: Record<Range, number> = { today: 0, "7d": 6, "30d": 29, "90d": 89 };
  start.setDate(now.getDate() - map[range]);
  return base.filter((r) => new Date(r.date) >= start);
}
