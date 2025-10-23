"use client";

import React, { useState } from "react";
import { CARD } from "@/lib/ui";

type Member = {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: "Ativo" | "Atrasado" | "Cancelado";
};

export default function MembersPage() {
  const [q, setQ] = useState("");
  const [members] = useState<Member[]>([]);

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(q.toLowerCase()) ||
      m.email.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className={`${CARD} p-5`}>
        <div className="text-sm text-white/60">Área de membros</div>
        <h2 className="text-lg font-semibold mt-1">Membros</h2>

        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1">
            <input
              placeholder="Buscar membro por nome ou e-mail"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-2.5 text-sm outline-none"
            />
          </div>
          <button className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm">
            Exportar CSV
          </button>
        </div>

        <div className="mt-4 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/60 border-b border-white/10">
                <th className="py-3 px-2">NOME</th>
                <th className="py-3 px-2">EMAIL</th>
                <th className="py-3 px-2">PLANO</th>
                <th className="py-3 px-2">STATUS</th>
                <th className="py-3 px-2 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td className="py-6 px-2 text-white/50" colSpan={5}>
                    Nenhum membro ainda.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id} className="border-b border-white/5 last:border-0">
                    <td className="py-3 px-2">{m.name}</td>
                    <td className="py-3 px-2">{m.email}</td>
                    <td className="py-3 px-2">{m.plan}</td>
                    <td className="py-3 px-2">{m.status}</td>
                    <td className="py-3 px-2">
                      <div className="flex justify-end gap-2">
                        <button className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-sm">Detalhes</button>
                        <button className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-sm">Suspender</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
