// components/StarfieldRoot.tsx
"use client";

import React from "react";
import Starfield from "./Starfield";

export default function StarfieldRoot() {
  // Somente posicionamento + z-index negativo para garantir que nunca cubra a UI
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden>
      <Starfield meteorEvery={16000} />
    </div>
  );
}
