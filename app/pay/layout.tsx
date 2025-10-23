// app/pay/layout.tsx
import { Suspense } from "react";
import PayTabs from "./_components/PayTabs";
import BlackHoleBg from "@/components/BlackHoleBg";

export default function PayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <Suspense fallback={<div className="h-10 rounded-xl bg-white/5" />}><PayTabs /></Suspense>
      <div>{children}</div>
    </div>
  );
}
