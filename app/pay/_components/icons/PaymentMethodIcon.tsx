"use client";

import { CreditCard, Barcode, Wallet } from "lucide-react";

export default function PaymentMethodIcon({ method }: { method: "Pix" | "Crédito" | "Boleto" | "PicPay" }) {
  if (method === "Crédito") return <CreditCard className="h-4 w-4" aria-label="Cartão de crédito" />;
  if (method === "Boleto")  return <Barcode className="h-4 w-4" aria-label="Boleto" />;
  if (method === "PicPay")  return <Wallet className="h-4 w-4" aria-label="PicPay" />;

  // PIX: pequeno losango em SVG (ícone leve e genérico)
  return (
    <svg aria-label="Pix" viewBox="0 0 24 24" className="h-4 w-4">
      <path d="M12 2l10 10-10 10L2 12 12 2z" fill="currentColor" />
    </svg>
  );
}
