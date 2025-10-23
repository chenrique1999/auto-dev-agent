"use client";

import PaymentMethodIcon from "@/app/pay/_components/icons/PaymentMethodIcon";

// ✅ exporte o tipo para podermos reusar no mock
export type SaleRow = {
  id: string;
  product: string;
  buyer: string;
  amount: number;
  status: "Aprovado" | "Pendente" | "Reembolsado";
  method: "Pix" | "Crédito" | "Boleto" | "PicPay";
};

export default function RecentSalesTable({ rows }: { rows: SaleRow[] }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-medium">Últimas vendas</h2>
        <button className="rounded-lg bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10 transition">
          Ver todas
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-center">
          <thead className="text-xs text-white/60 text-center">
            <tr className="border-b border-white/10">
              <th className="py-2 pr-3">Pedido</th>
              <th className="py-2 pr-3">Produto</th>
              <th className="py-2 pr-3">Cliente</th>
              <th className="py-2 pr-3">Método</th>
              <th className="py-2 pr-3">Valor</th>
              <th className="py-2 pr-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-white/50">
                  Sem registros
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-white/5">
                  <td className="py-2 pr-3">{r.id}</td>
                  <td className="py-2 pr-3">{r.product}</td>
                  <td className="py-2 pr-3">{r.buyer}</td>
                  <td className="py-2 pr-3">
  <div className="flex justify-center">
    <PaymentMethodIcon method={r.method} />
  </div>
</td>
                  <td className="py-2 pr-3">{toBRL(r.amount)}</td>
                  <td className="py-2 pr-3">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: SaleRow["status"] }) {
  const map = {
    Aprovado: "bg-emerald-500/20 text-emerald-300",
    Pendente: "bg-amber-500/20 text-amber-300",
    Reembolsado: "bg-rose-500/20 text-rose-300",
  } as const;

  return (
    <span className={`rounded-lg px-2 py-1 text-[11px] ${map[status]}`}>
      {status}
    </span>
  );
}

function toBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}
