"use client";

import { useEffect, useMemo, useState } from "react";
import { CARD, CONTAINER } from "@/lib/ui";

type PayLink = {
  id: string;
  name: string;
  amount: number;
  currency: "USD" | "BRL";
  href: string;
};

const STORAGE = "pay.links";

const seed: PayLink[] = [
  {
    id: "ppcYZCu4MdXmRHN93e",
    name: "BOT",
    amount: 3,
    currency: "USD",
    href: "https://gx.link/ppcYZCu4MdXmRHN93e",
  },
];

function uid() {
  return Math.random().toString(36).slice(2, 12);
}

export default function LinksPage() {
  const [items, setItems] = useState<PayLink[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PayLink | null>(null);

  // boot
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE);
    if (!raw) {
      localStorage.setItem(STORAGE, JSON.stringify(seed));
      setItems(seed);
    } else {
      setItems(JSON.parse(raw));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE, JSON.stringify(items));
  }, [items]);

  const upsert = (payload: Omit<PayLink, "id" | "href"> & { id?: string }) => {
    const id = payload.id ?? uid();
    const href = `https://gx.link/${id}`;
    setItems((prev) => {
      const exists = prev.findIndex((p) => p.id === id);
      if (exists >= 0) {
        const next = [...prev];
        next[exists] = { id, href, ...payload };
        return next;
      }
      return [...prev, { id, href, ...payload }];
    });
    setOpen(false);
    setEditing(null);
  };

  const remove = (id: string) =>
    setItems((prev) => prev.filter((p) => p.id !== id));

  const copy = (v: string) => navigator.clipboard.writeText(v);

  return (
    <div className={CONTAINER}>
      <div className={`${CARD} p-5`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Links de pagamento</h3>
          <button className="btn" onClick={() => { setEditing(null); setOpen(true); }}>
            Criar link ⚡
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/60">
                <th className="py-2 text-left">Nome</th>
                <th className="py-2 text-left">ID</th>
                <th className="py-2 text-left">Montante</th>
                <th className="py-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((l) => (
                <tr key={l.id} className="border-t border-white/10">
                  <td className="py-3">{l.name}</td>
                  <td className="py-3 font-mono">{l.id}</td>
                  <td className="py-3">${l.amount.toFixed(2)} {l.currency}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button className="btn" onClick={() => copy(l.href)}>Copiar</button>
                      <button className="btn" onClick={() => { setEditing(l); setOpen(true); }}>Editar</button>
                      <button className="btn" onClick={() => remove(l.id)}>Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <LinkModal
          data={editing}
          onClose={() => { setOpen(false); setEditing(null); }}
          onSubmit={(payload) => upsert(payload)}
        />
      )}
    </div>
  );
}

/* ---------- Modal simples, sem libs ---------- */
function LinkModal({
  data,
  onClose,
  onSubmit,
}: {
  data: PayLink | null;
  onClose: () => void;
  onSubmit: (p: Omit<PayLink, "id" | "href"> & { id?: string }) => void;
}) {
  const [name, setName] = useState(data?.name ?? "");
  const [amount, setAmount] = useState<string>(data ? String(data.amount) : "0");
  const [currency, setCurrency] = useState<"USD" | "BRL">(data?.currency ?? "USD");

  const parsedAmount = useMemo(() => {
    const v = Number((amount || "0").replace(",", "."));
    return Number.isFinite(v) ? Math.max(0, v) : 0;
  }, [amount]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-neutral-900 p-5 ring-1 ring-white/10">
        <h4 className="text-lg font-semibold">{data ? "Editar" : "Criar"} link</h4>

        <div className="mt-4 space-y-3">
          <input className="field" placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <div className="select-reset select-wrap">
              <select className="field pr-10" value={currency} onChange={(e) => setCurrency(e.target.value as "USD" | "BRL")}>
                <option value="USD">USD</option>
                <option value="BRL">BRL</option>
              </select>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <input className="field" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button
            className="btn"
            onClick={() =>
              onSubmit({
                id: data?.id,
                name: name.trim() || "Sem nome",
                amount: parsedAmount,
                currency,
              })
            }
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
