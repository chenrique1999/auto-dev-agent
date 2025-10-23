"use client";
import React from "react";
import { CARD } from "@/lib/ui";

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <header className={`${CARD} p-5`}>
        <div className="text-[12px] text-white/60">Workspace</div>
        <h1 className="text-xl font-semibold mt-1">Configurações</h1>
        <p className="text-[13px] text-white/65 mt-1">Definições de workspace, branding e integrações.</p>
      </header>

      <section className="grid md:grid-cols-2 gap-4">
        <div className={`${CARD} p-5`}>
          <div className="text-sm font-medium">Workspace</div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-[13px]">
            <div className={`${CARD} p-4`}>Nome do workspace</div>
            <div className={`${CARD} p-4`}>Domínio</div>
          </div>
        </div>
        <div className={`${CARD} p-5`}>
          <div className="text-sm font-medium">Branding</div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-[13px]">
            <div className={`${CARD} p-4`}>Logo</div>
            <div className={`${CARD} p-4`}>Cores</div>
          </div>
        </div>
        <div className={`${CARD} p-5`}>
          <div className="text-sm font-medium">Integrações</div>
          <ul className="mt-3 space-y-2 text-[13px] text-white/75">
            <li>• Meta / CAPI</li>
            <li>• Google</li>
            <li>• TikTok</li>
          </ul>
        </div>
        <div className={`${CARD} p-5`}>
          <div className="text-sm font-medium">Segurança</div>
          <ul className="mt-3 space-y-2 text-[13px] text-white/75">
            <li>• 2FA</li>
            <li>• Sessões</li>
            <li>• Tokens de API</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
