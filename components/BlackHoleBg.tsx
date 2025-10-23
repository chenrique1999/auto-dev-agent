"use client";

import Image from "next/image";

/**
 * Fundo estático (apenas imagem) com máscaras leves
 * - Sem listeners, sem <video>, sem reflow.
 * - Camadas: imagem base + escurecimento + vinheta.
 */
export default function BlackHoleBg() {
  return (
    <>
      {/* Imagem base */}
      <div className="pointer-events-none fixed inset-0 -z-60">
        <Image
          src="/bg/blackhole.jpg"
          alt=""
          fill
          priority            // pinta rápido no first paint
          quality={60}        // bom equilíbrio nitidez x tamanho
          sizes="100vw"
          className="object-cover select-none will-change-transform"
        />
      </div>

      {/* Escurecimento (melhora legibilidade) */}
      <div className="pointer-events-none fixed inset-0 -z-50 bg-black/35" />

      {/* Vinheta suave (bordas mais escuras) */}
      <div className="pointer-events-none fixed inset-0 -z-40
        bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_38%,rgba(0,0,0,0.55)_100%)]" />
    </>
  );
}
