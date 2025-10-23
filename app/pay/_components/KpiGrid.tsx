"use client";

type Props = {
  data: {
    totals: { sales: number; boletos: number; refunds: number; commissions: number };
  };
};

export default function KpiGrid({ data }: Props) {
  const { sales, boletos, refunds, commissions } = data.totals;

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Kpi title="Vendas" value={toBRL(sales)} subtitle="Mês atual" icon="🛒" />
      <Kpi title="Boletos" value={toBRL(boletos)} subtitle="Não compensado" icon="📄" />
      <Kpi title="Reembolsos" value={toBRL(refunds)} subtitle="Mês atual" icon="↩️" />
      <Kpi title="Comissões" value={toBRL(commissions)} subtitle="Afiliados" icon="💸" />
    </section>
  );
}

function Kpi({ title, value, subtitle, icon }: { title: string; value: string; subtitle?: string; icon?: string }) {
  return (
    <div className="rounded-2xl bg-white/5 p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/70">{title}</p>
        {icon ? <span className="text-base/5">{icon}</span> : null}
      </div>
      <p className="mt-2 text-lg font-semibold">{value}</p>
      {subtitle ? <p className="mt-1 text-[11px] text-white/50">{subtitle}</p> : null}
    </div>
  );
}

function toBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}
