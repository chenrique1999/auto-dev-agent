"use client";

export default function Greeting() {
  const h = new Date().getHours();
  const saudacao = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";

  // maior, proporcional à linha
  return (
    <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
      {saudacao}, chefe.
    </h1>
  );
}