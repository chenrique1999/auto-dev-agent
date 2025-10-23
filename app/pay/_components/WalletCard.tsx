"use client";

type Wallet = { total: number; pending: number; available: number };

export default function WalletCard({ wallet }: { wallet: Wallet }) {
  return (
    <div className="rounded-2xl bg-white/5 p-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Minha carteira</h2>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-white/60">Total geral</p>
          <p className="mt-1 text-base font-semibold">{toBRL(wallet.total)}</p>
        </div>
        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-white/60">Pendente</p>
          <p className="mt-1 text-base font-semibold">{toBRL(wallet.pending)}</p>
        </div>
        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-white/60">Disponível</p>
          <p className="mt-1 text-base font-semibold">{toBRL(wallet.available)}</p>
        </div>
      </div>

      <button
        className="mt-3 w-full rounded-xl bg-white/10 px-3 py-2 text-sm font-medium hover:bg-white/15 transition"
        onClick={() => alert("Fluxo de saque virá aqui")}
      >
        Realizar Saque
      </button>
    </div>
  );
}

function toBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}
