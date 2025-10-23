// app/pay/sales/_components/icons/StatusBadge.tsx
"use client";

export default function StatusBadge({
  status,
}: {
  status: "Aprovada" | "Pendente" | "Cancelada" | "Estornada";
}) {
  const map = {
    Aprovada:  "bg-emerald-500/20 text-emerald-300",
    Pendente:  "bg-amber-500/20 text-amber-300",
    Cancelada: "bg-zinc-500/20 text-zinc-300",
    Estornada: "bg-rose-500/20 text-rose-300",
  } as const;

  return (
    <span className={`rounded-lg px-2 py-1 text-[11px] ${map[status]}`}>
      {status}
    </span>
  );
}
