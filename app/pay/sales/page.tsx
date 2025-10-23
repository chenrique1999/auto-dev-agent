// app/pay/sales/page.tsx
import { Suspense } from "react";
import SalesClient from "../_components/SalesClient"; // <= ajuste aqui

export default function Page() {
  return (
    <Suspense fallback={<div className="h-44 rounded-2xl bg-white/5" />}>
      <SalesClient />
    </Suspense>
  );
}
