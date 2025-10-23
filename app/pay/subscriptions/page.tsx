"use client";

import { useEffect, useState, FormEvent } from "react";
import { CARD, CONTAINER } from "@/lib/ui";

/** ===== Tipos e helpers ===== */
type Plan = {
  id: string;
  name: string;
  price: number;
  interval: "mensal" | "anual";
  active: number;
};

const STORAGE = "pay.plans";
const seed: Plan[] = [
  { id: "plan_premium", name: "Premium", price: 19, interval: "mensal", active: 0 },
];

function uid() {
  return "plan_" + Math.random().toString(36).slice(2, 10);
}

/** ===== Página ===== */
export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [open, setOpen] = useState(false);

  // carrega/planta seed
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE);
    if (!raw) {
      localStorage.setItem(STORAGE, JSON.stringify(seed));
      setPlans(seed);
    } else {
      try {
        setPlans(JSON.parse(raw));
      } catch {
        setPlans(seed);
      }
    }
  }, []);

  // persiste
  useEffect(() => {
    localStorage.setItem(STORAGE, JSON.stringify(plans));
  }, [plans]);

  // cria plano
  const create = (p: Omit<Plan, "id" | "active">) => {
    setPlans((prev) => [...prev, { id: uid(), active: 0, ...p }]);
  };

  // gera link (mock) e copia
  const copyLink = (id: string) => {
    const url = `https://gx.link/sub/${id}`;
    navigator.clipboard?.writeText(url);
    alert("Link copiado:\n" + url);
  };

  return (
    <div className={CONTAINER}>
      <div className={`${CARD} p-5`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Assinaturas</h3>
          <button className="btn" onClick={() => setOpen(true)}>
            Criar assinatura
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/60">
                <th className="py-2 text-left">Plano</th>
                <th className="py-2 text-left">Preço</th>
                <th className="py-2 text-left">Periodicidade</th>
                <th className="py-2 text-left">Ativos</th>
                <th className="py-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id} className="border-t border-white/10">
                  <td className="py-3">{p.name}</td>
                  <td className="py-3">${p.price.toFixed(2)}</td>
                  <td className="py-3 capitalize">{p.interval}</td>
                  <td className="py-3">{p.active}</td>
                  <td className="py-3">
                    <button className="btn" onClick={() => copyLink(p.id)}>
                      Gerar link
                    </button>
                  </td>
                </tr>
              ))}
              {plans.length === 0 && (
                <tr>
                  <td className="py-6 text-center text-white/50" colSpan={5}>
                    Nenhum plano ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {open && <CreatePlan onClose={() => setOpen(false)} onSubmit={create} />}
    </div>
  );
}

/** ===== Modal de criação (embutido) ===== */
type CreatePlanProps = {
  onClose: () => void;
  onSubmit: (data: Omit<Plan, "id" | "active">) => void;
};

function CreatePlan({ onClose, onSubmit }: CreatePlanProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState<string>("");
  const [interval, setInterval] = useState<"mensal" | "anual">("mensal");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const p = parseFloat(String(price).replace(",", "."));
    if (!name.trim()) return alert("Informe um nome.");
    if (Number.isNaN(p) || p <= 0) return alert("Preço inválido.");

    onSubmit({ name: name.trim(), price: p, interval });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className={`${CARD} w-full max-w-lg p-5`}>
        <div className="flex items-center justify-between">
          <h4 className="text-base font-semibold">Nova assinatura</h4>
          <button className="text-white/60 hover:text-white" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </div>

        <form onSubmit={submit} className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs text-white/60">Nome do plano</label>
            <input
              className="field"
              placeholder="Ex.: Premium"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-white/60">Preço</label>
            <input
              className="field"
              inputMode="decimal"
              placeholder="19.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-white/60">Periodicidade</label>
            <div className="select-wrap">
              <select
                className="field pr-9"
                value={interval}
                onChange={(e) => setInterval(e.target.value as "mensal" | "anual")}
              >
                <option value="mensal">Mensal</option>
                <option value="anual">Anual</option>
              </select>
              {/* chevron */}
              <svg width="16" height="16" viewBox="0 0 24 24" className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60">
                <path fill="currentColor" d="M7 10l5 5 5-5z" />
              </svg>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button type="button" className="btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
