// app/pay/page.tsx
import { Suspense } from "react";
import PayHomeClient from "./_components/PayHomeClient";

export default function Page() {
  return (
    <>
      {/* BACKGROUND fixo global (funciona em produção) */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 bg-no-repeat bg-cover bg-center pointer-events-none select-none"
        style={{ backgroundImage: "url(/bg/blackhole.webp)" }}
      />

      {/* Oculta a barra de rolagem só nesta página */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            html, body { overflow-y: hidden !important; }
          `,
        }}
      />

      <Suspense fallback={<div className="h-44 rounded-2xl bg-white/5" />}>
        <PayHomeClient />
      </Suspense>
    </>
  );
}
