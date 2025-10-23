// app/(app)/pay/extrato/page.tsx
import { CARD } from "@/lib/ui";

export default function ExtratoPage() {
  return (
    <div className={`${CARD} p-5`}>
      <h3 className="text-lg font-semibold">Extrato</h3>
      <p className="mt-2 text-white/70 text-sm">
        Seu extrato ficará disponível aqui. (Em breve: filtros por período, tipo e status)
      </p>
    </div>
  );
}