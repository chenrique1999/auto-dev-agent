// app/pay/_components/SalesTable.tsx
"use client";

import PaymentMethodIcon from "./icons/PaymentMethodIcon";
import StatusBadge from "./icons/StatusBadge";

export type Sale = {
  id: string;
  date: string;               // ISO
  amount: number;
  currency: "BRL" | "USD";
  method: "Pix" | "Crédito" | "Boleto" | "PicPay";
  status: "Aprovada" | "Pendente" | "Cancelada" | "Estornada";
  product: string;
  offer?: string;
  sellerType: "Autoral" | "Afiliação" | "Coprodução";
  buyer: { name: string; email?: string; phone?: string };
  affiliate?: { id?: string; email?: string };
  coupon?: string;
  transaction?: { code?: string; ip?: string };
};

export default function SalesTable({
  rows, onRowClick,
}: {
  rows: Sale[];
  onRowClick: (s: Sale)=>void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-center">
        <thead className="text-xs text-white/60 text-center">
          <tr className="border-b border-white/10">
            <th className="py-2 pr-3">Cliente</th>
            <th className="py-2 pr-3">Data</th>
            <th className="py-2 pr-3">Valor</th>
            <th className="py-2 pr-3">Moeda</th>
            <th className="py-2 pr-3">Mét.</th>
            <th className="py-2 pr-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-6 text-center text-white/50">Sem registros</td>
            </tr>
          ) : rows.map((r) => (
            <tr
              key={r.id}
              className="cursor-pointer border-b border-white/5 hover:bg-white/5"
              onClick={()=>onRowClick(r)}
            >
              <td className="py-2 pr-3">{r.buyer.name}</td>
              <td className="py-2 pr-3">{formatDate(r.date)}</td>
              <td className="py-2 pr-3">{toMoney(r.amount, r.currency)}</td>
              <td className="py-2 pr-3">{r.currency}</td>
              <td className="py-2 pr-3">
                <div className="flex justify-center">
                  <PaymentMethodIcon method={r.method} />
                </div>
              </td>
              <td className="py-2 pr-3"><StatusBadge status={r.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const date = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(d);
  const time = new Intl.DateTimeFormat("pt-BR", { timeStyle: "short" }).format(d);
  return `${date} ${time}`;
}

function toMoney(v: number, currency: "BRL" | "USD") {
  return new Intl.NumberFormat(currency === "BRL" ? "pt-BR" : "en-US", {
    style: "currency", currency,
  }).format(v);
}
