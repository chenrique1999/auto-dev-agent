// app/(app)/pay/saque/page.tsx
"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CARD } from "@/lib/ui";

const WITHDRAW_FEE = 2; // USDT

export default function SaquePage() {
  const router = useRouter();
  const [addr, setAddr] = useState("");
  const [amt, setAmt] = useState(0);

  const net = useMemo(() => Math.max(amt - WITHDRAW_FEE, 0), [amt]);

  return (
    <div className={`${CARD} p-5`}>
      <h3 className="text-lg font-semibold">Saque</h3>

      <div className="mt-4 space-y-4 max-w-3xl mx-auto">
        <div>
          <div className="text-sm text-white/70">Endereço TRON (USDT)</div>
          <input className="field mt-1" placeholder="Txxxxxxxxxxxxxxxxxxxx" value={addr} onChange={(e)=>setAddr(e.target.value)} />
        </div>
        <div>
          <div className="text-sm text-white/70">Valor a sacar</div>
          <input type="number" inputMode="decimal" className="field mt-1" placeholder="USDT $ 0.00" value={amt} onChange={(e)=>setAmt(Number(e.target.value||0))} />
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-sm">
          <div className="flex justify-between"><span>Custo de saque</span><span>${WITHDRAW_FEE.toFixed(2)} USDT</span></div>
          <div className="flex justify-between"><span>Você receberá</span><span>${net.toFixed(2)} USDT</span></div>
        </div>

        <div className="flex gap-2">
          <button className="btn bg-white/0" onClick={()=>router.push("/pay")}>← Voltar</button>
          <button className="btn flex-1">Revisar saque</button>
        </div>
      </div>
    </div>
  );
}
