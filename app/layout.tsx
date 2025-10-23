// app/layout.tsx
import "./globals.css";
import type { ReactNode, CSSProperties } from "react";
import StarfieldRoot from "@/components/StarfieldRoot";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import BlackHoleBg from "@/components/BlackHoleBg";

export default function RootLayout({ children }: { children: ReactNode }) {
  // Estes valores são os que você já usava (ajuste se quiser)
  const MENU_W = "260px";
  const GUTTER = "clamp(28px, 5vw, 56px)";
  const GAP_LG = "32px";
  const GAP_XL = "36px";
  const GAP_2XL = "120px";
  const CONTENT_MAX = "1260px";

  const styleVars: CSSProperties = {
    ["--menu-w" as any]: MENU_W,
    ["--gutter" as any]: GUTTER,
    ["--gap-lg" as any]: GAP_LG,
    ["--gap-xl" as any]: GAP_XL,
    ["--gap-2xl" as any]: GAP_2XL,
    ["--content-max" as any]: CONTENT_MAX,
  };

  return (
    <html lang="pt-BR">
      <body className="min-h-dvh" style={styleVars}>
        {/* FUNDO: imagem do buraco negro (leve) */}
        <BlackHoleBg />

        {/* Estrelas por cima do fundo */}
        <StarfieldRoot />

        {/* Sidebar flutuando à esquerda */}
        <Sidebar />

        {/* Conteúdo com os mesmos paddings que já estavam OK no seu projeto */}
        <div
          className="
            relative
            lg:pl-[calc(var(--gutter)+var(--menu-w)+var(--gap-lg))]
            xl:pl-[calc(var(--gutter)+var(--menu-w)+var(--gap-xl))]
            2xl:pl-[calc(var(--gutter)+var(--menu-w)+var(--gap-2xl))]
          "
        >
          <div className="max-w-[var(--content-max)] px-3 md:px-4">
            <Topbar />
            <main className="min-w-0">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
