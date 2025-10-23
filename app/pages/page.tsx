"use client";
import React from "react";
import { CARD } from "@/lib/ui";
import { FileText } from "lucide-react";

const pages = [
  { id: 1, title: "Landing — Produto X", status: "Publicado", updated: "Hoje 12:04" },
  { id: 2, title: "Captura — Webinar", status: "Rascunho", updated: "Ontem 18:31" },
];

export default function PagesList() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Suas páginas</h1>
        <button className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-sm">+ Nova LP</button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {pages.map(p => (
          <div key={p.id} className={`${CARD} p-4 flex items-start gap-3`}>
            <div className="p-2 rounded-lg bg-white/5"><FileText className="w-4 h-4" /></div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{p.title}</div>
              <div className="mt-1 text-xs text-white/60">
                <span className={`mr-2 px-2 py-0.5 rounded-full bg-white/10`}>
                  {p.status}
                </span>
                <span>• Atualizado: {p.updated}</span>
              </div>
              <div className="mt-3 flex gap-2 text-sm">
                <button className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15">Editar</button>
                <button className="px-3 py-1 rounded-lg hover:bg-white/10">Abrir</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
