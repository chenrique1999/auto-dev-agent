// components/icons/LogoGALAXIFY.tsx
"use client";

type Props = {
  className?: string;  // controle de tamanho: ex. "text-[34px]"
  glow?: boolean;      // liga/desliga brilho do texto
  label?: string;      // a11y
};

export default function LogoGALAXIFY({
  className = "text-[30px] md:text-[34px]",
  glow = true,
  label = "GALAXIFY",
}: Props) {
  // brilho saindo da própria tipografia
  const textShadow = glow
    ? `
      0 0 4px rgba(255,255,255,.85),
      0 0 10px rgba(199,210,254,.65),
      0 0 18px rgba(147,197,253,.50),
      0 0 28px rgba(99,102,241,.35)
    `
    : "none";

  return (
    <div role="img" aria-label={label} className={`inline-flex select-none items-center leading-none ${className}`}>
      <span
        style={{ textShadow }}
        className="font-black tracking-[0.18em] text-white/95"
      >
        GALAXIFY
      </span>
    </div>
  );
}
