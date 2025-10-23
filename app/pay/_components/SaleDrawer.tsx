"use client";

import type { ReactNode } from "react";
import { Motion } from "./motion";
import type { Sale as SaleBase } from "./SalesTable";
import PaymentMethodIcon from "./icons/PaymentMethodIcon";
import StatusBadge from "./icons/StatusBadge";
import { X, Copy, RotateCcw } from "lucide-react";

/** Estende o Sale base com campos usados apenas no UI */
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

export default function SaleDrawer({
  sale,
  onClose,
}: { sale: UISale | null; onClose: () => void }) {
  if (!sale) return null;

  const canRefund = sale.status === "Aprovada";
  const doRefund = () => {
    if (!canRefund) return;
    if (confirm(`Confirmar estorno de ${toMoney(sale.amount, sale.currency)} para ${sale.buyer.name}?`)) {
      alert("Estorno solicitado (DEMO). Integre com PSP aqui.");
    }
  };

  const waHref = sale.buyer.phone
    ? `https://wa.me/${sale.buyer.phone.replace(/\D/g, "")}`
    : undefined;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <Motion.div
        initial={{ x: 420, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 420, opacity: 0 }}
        className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-black/90 p-4"
      >
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium">ID da transação: {sale.id}</h2>
          <div className="flex items-center gap-2">
            <button
              disabled={!canRefund}
              onClick={doRefund}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs transition ${
                canRefund ? "bg-white/10 hover:bg-white/15" : "cursor-not-allowed bg-white/5 text-white/40"
              }`}
              title={canRefund ? "Estornar" : "Somente vendas aprovadas podem ser estornadas"}
            >
              <RotateCcw className="h-3.5 w-3.5" /> Estornar
            </button>
            <button onClick={onClose} className="rounded-lg bg-white/5 p-2 hover:bg-white/10">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Produto */}
        <section className="rounded-xl bg-white/5 p-3">
          <p className="text-xs text-white/60">Produto</p>
          <p className="mt-1 text-sm font-medium">{sale.product}</p>
          <p className="text-xs text-white/50">{sale.offer || "–"}</p>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <Info label="Status"><StatusBadge status={sale.status} /></Info>
            <Info label="Método"><PaymentMethodIcon method={sale.method} /></Info>
            <Info label="Valor">{toMoney(sale.amount, sale.currency)}</Info>
            <Info label="Data">{formatDate(sale.date)}</Info>
          </div>
        </section>

        {/* Comprador */}
        <section className="mt-3 rounded-xl bg-white/5 p-3">
          <p className="mb-2 text-xs text-white/60">Comprador</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <InfoCopy label="Nome" value={sale.buyer.name} />
            <InfoCopy label="E-mail" value={sale.buyer.email ?? "–"} />
            <InfoCopy
              label="Telefone"
              value={sale.buyer.phone ?? "–"}
              action={
                waHref ? (
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md bg-emerald-500/20 px-2 py-1 text-[11px] hover:bg-emerald-500/30"
                  >
                    WhatsApp
                  </a>
                ) : null
              }
            />
            <InfoCopy
              label="Cidade/País"
              value={`${sale.geo?.city ?? "–"}/${sale.geo?.country ?? "–"}`}
            />
          </div>

          {/* Recorrência */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <Info label="Compras do cliente">{String(sale.buyerStats?.purchases ?? 1)}</Info>
            <Info label="LTV">
              {sale.buyerStats?.ltv != null ? toMoney(sale.buyerStats.ltv, sale.currency) : "–"}
            </Info>
            <Info label="1ª compra">
              {sale.buyerStats?.firstBuyAt ? formatDate(sale.buyerStats.firstBuyAt) : "–"}
            </Info>
            <Info label="Última compra">
              {sale.buyerStats?.lastBuyAt ? formatDate(sale.buyerStats.lastBuyAt) : "–"}
            </Info>
          </div>
        </section>

        {/* Transação + Marketing + Dispositivo */}
        <section className="mt-3 rounded-xl bg-white/5 p-3">
          <p className="mb-2 text-xs text-white/60">Transação</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <InfoCopy label="Código" value={sale.transaction?.code ?? "–"} />
            <InfoCopy label="IP" value={sale.transaction?.ip ?? "–"} />
            <Info label="Vendedor">{sale.sellerType}</Info>
            <InfoCopy label="Cupom" value={sale.coupon ?? "–"} />
            <Info label="UTM">
              {[sale.utm?.source, sale.utm?.medium, sale.utm?.campaign].filter(Boolean).join(" / ") || "–"}
            </Info>
            <Info label="Dispositivo">
              {[sale.device?.os, sale.device?.browser].filter(Boolean).join(" / ") || "–"}
            </Info>
          </div>
        </section>

        {/* Afiliado */}
        <section className="mt-3 rounded-xl bg-white/5 p-3">
          <p className="mb-2 text-xs text-white/60">Afiliado</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <InfoCopy label="ID" value={sale.affiliate?.id ?? "–"} />
            <InfoCopy label="E-mail" value={sale.affiliate?.email ?? "–"} />
          </div>
        </section>
      </Motion.div>
    </>
  );
}

function Info({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-lg bg-black/40 p-2">
      <p className="text-white/60">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function InfoCopy({
  label, value, action,
}: { label: string; value: string; action?: ReactNode }) {
  const copy = async () => {
    const text = value ?? "";
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error("no-clipboard");
      }
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
  };

  return (
    <div className="relative rounded-lg bg-black/40 p-2 pr-10">
      <p className="text-white/60">{label}</p>
      <p className="mt-1 break-all">{value}</p>
      <button
        onClick={copy}
        className="absolute right-2 top-2 rounded-md bg-white/10 p-1.5 text-white/80 hover:bg-white/15"
        title="Copiar"
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

function toMoney(v: number, currency: "BRL" | "USD") {
  return new Intl.NumberFormat(currency === "BRL" ? "pt-BR" : "en-US", { style: "currency", currency }).format(v);
}
function formatDate(iso: string) {
  const d = new Date(iso);
  const date = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(d);
  const time = new Intl.DateTimeFormat("pt-BR", { timeStyle: "short" }).format(d);
  return `${date} ${time}`;
}
