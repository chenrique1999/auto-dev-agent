// app/pay/_components/SalesFilters.tsx
"use client";

import { useMemo, useState } from "react";
import type { Sale } from "./SalesTable";
import { Filter, X } from "lucide-react";

export type FiltersState = {
  dateStart?: string;        // YYYY-MM-DD
  dateEnd?: string;          // YYYY-MM-DD
  product?: string;
  offer?: string;
  method?: Array<Sale["method"]>;
  status?: Array<Sale["status"]>;
  customerEmail?: string;
  customerPhone?: string;
  affiliateEmail?: string;
  affiliateId?: string;
  coupon?: string;
  sellerType?: Sale["sellerType"];
};

export default function SalesFilters({
  value, onChange, dataset,
}: {
  value: FiltersState;
  onChange: (v: FiltersState)=>void;
  dataset: Sale[];
}) {
  const [open, setOpen] = useState(false);
  const uniq = <K extends keyof Sale>(k: K) =>
    Array.from(new Set(dataset.map(d => String(d[k] ?? "")).filter(Boolean)));

  const products = useMemo(()=>uniq("product"), [dataset]);
  const offers   = useMemo(()=>uniq("offer"),   [dataset]);

  const clear = () => onChange({});

  const activeCount = Object.values(value).reduce((a,v)=> {
    if (v == null) return a;
    if (Array.isArray(v)) return a + (v.length ? 1 : 0);
    return a + (String(v).trim() ? 1 : 0);
  }, 0);

  return (
    <div className="relative">
      <button
        onClick={()=>setOpen(v=>!v)}
        className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition"
      >
        <Filter className="h-4 w-4" />
        Filtros{activeCount ? `: ${activeCount}` : ""}
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-30" onClick={()=>setOpen(false)} />
          <div className="absolute z-40 mt-2 w-[680px] rounded-2xl border border-white/10 bg-black/80 p-3 backdrop-blur">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium">Filtros</p>
              <button onClick={()=>setOpen(false)} className="rounded-lg bg-white/5 px-2 py-1 text-xs hover:bg-white/10">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Datas */}
              <div className="rounded-xl bg-white/5 p-3">
                <p className="mb-2 text-xs text-white/60">Período</p>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={value.dateStart || ""}
                    onChange={e=>onChange({ ...value, dateStart: e.target.value || undefined })}
                    className="w-full rounded-lg bg-black/40 px-2 py-1 text-sm outline-none"
                  />
                  <input
                    type="date"
                    value={value.dateEnd || ""}
                    onChange={e=>onChange({ ...value, dateEnd: e.target.value || undefined })}
                    className="w-full rounded-lg bg-black/40 px-2 py-1 text-sm outline-none"
                  />
                </div>
              </div>

              {/* Produto/Oferta */}
              <div className="rounded-xl bg-white/5 p-3">
                <p className="mb-2 text-xs text-white/60">Produto &amp; Oferta</p>
                <div className="flex gap-2">
                  <select
                    value={value.product || ""}
                    onChange={e=>onChange({ ...value, product: e.target.value || undefined })}
                    className="w-full rounded-lg bg-black/40 px-2 py-1 text-sm"
                  >
                    <option value="">Todos os produtos</option>
                    {products.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <select
                    value={value.offer || ""}
                    onChange={e=>onChange({ ...value, offer: e.target.value || undefined })}
                    className="w-full rounded-lg bg-black/40 px-2 py-1 text-sm"
                  >
                    <option value="">Todas as ofertas</option>
                    {offers.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              {/* Método/Status */}
              <div className="rounded-xl bg-white/5 p-3">
                <p className="mb-2 text-xs text-white/60">Método de pagamento</p>
                <CheckboxRow
                  options={["Pix","Crédito","Boleto","PicPay"] as Array<Sale["method"]>}
                  values={value.method || []}
                  onChange={(v)=>onChange({ ...value, method: v.length ? v : undefined })}
                />

                <p className="mb-2 mt-3 text-xs text-white/60">Status da venda</p>
                <CheckboxRow
                  options={["Aprovada", "Pendente", "Cancelada", "Estornada"] as Array<Sale["status"]>}
                  values={value.status || []}
                  onChange={(v) => onChange({ ...value, status: v.length ? v : undefined })}
                />
              </div>

              {/* Identificadores */}
              <div className="rounded-xl bg-white/5 p-3">
                <p className="mb-2 text-xs text-white/60">Identificadores</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    placeholder="E-mail do cliente"
                    value={value.customerEmail || ""}
                    onChange={e=>onChange({ ...value, customerEmail: e.target.value || undefined })}
                    className="rounded-lg bg-black/40 px-2 py-1 text-sm outline-none"
                  />
                  <input
                    placeholder="Telefone do cliente"
                    value={value.customerPhone || ""}
                    onChange={e=>onChange({ ...value, customerPhone: e.target.value || undefined })}
                    className="rounded-lg bg-black/40 px-2 py-1 text-sm outline-none"
                  />
                  <input
                    placeholder="E-mail do afiliado"
                    value={value.affiliateEmail || ""}
                    onChange={e=>onChange({ ...value, affiliateEmail: e.target.value || undefined })}
                    className="rounded-lg bg-black/40 px-2 py-1 text-sm outline-none"
                  />
                  <input
                    placeholder="ID do afiliado"
                    value={value.affiliateId || ""}
                    onChange={e=>onChange({ ...value, affiliateId: e.target.value || undefined })}
                    className="rounded-lg bg-black/40 px-2 py-1 text-sm outline-none"
                  />
                  <input
                    placeholder="Cupom de desconto"
                    value={value.coupon || ""}
                    onChange={e=>onChange({ ...value, coupon: e.target.value || undefined })}
                    className="rounded-lg bg-black/40 px-2 py-1 text-sm outline-none"
                  />
                  <select
                    value={value.sellerType || ""}
                    onChange={e=>onChange({ ...value, sellerType: (e.target.value || undefined) as any })}
                    className="rounded-lg bg-black/40 px-2 py-1 text-sm"
                  >
                    <option value="">Tipo de vendedor</option>
                    <option>Autoral</option>
                    <option>Afiliação</option>
                    <option>Coprodução</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <button onClick={clear} className="text-xs text-white/60 hover:text-white">Limpar filtros</button>
              <div className="flex items-center gap-2">
                <button onClick={()=>setOpen(false)} className="rounded-lg bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10">
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function CheckboxRow<T extends string>({
  options, values, onChange,
}: { options: T[]; values: T[]; onChange: (v: T[])=>void }) {
  const toggle = (opt: T) =>
    onChange(values.includes(opt) ? values.filter(v => v !== opt) : [...values, opt]);

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <label
          key={opt}
          className={`cursor-pointer rounded-lg px-2 py-1 text-xs ${values.includes(opt) ? "bg-white/15" : "bg-black/40 hover:bg-black/30"}`}
        >
          <input type="checkbox" className="mr-1 align-middle" checked={values.includes(opt)} onChange={()=>toggle(opt)} />
          {opt}
        </label>
      ))}
    </div>
  );
}
