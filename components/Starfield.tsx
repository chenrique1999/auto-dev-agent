// components/Starfield.tsx
"use client";

import React from "react";

type Meteor = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number };
type Star = { x: number; y: number; r: number; a: number; tw: number; c: string };

export default function Starfield({ meteorEvery = 16000 }: { meteorEvery?: number }) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const runningRef = React.useRef(true);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // --- sizing helpers
    const getDPR = () => Math.min(Math.max(1, window.devicePixelRatio || 1), 1.75);
    let dpr = getDPR();
    let w = Math.floor(window.innerWidth);
    let h = Math.floor(window.innerHeight);

    const setSize = () => {
      dpr = getDPR();
      w = Math.floor(window.innerWidth);
      h = Math.floor(window.innerHeight);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    setSize();

    // --- content builders
    const STAR_COLORS = ["#ffffff", "#dbeafe", "#ffd8a8", "#f3e8ff"] as const;

    const buildStars = () => {
      const base = Math.floor((w * h) / 80000);
      const count = Math.min(900, Math.max(220, Math.floor(base * (w < 768 ? 0.7 : 1) / (dpr > 1.2 ? 1.1 : 1))));
      const stars: Star[] = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.1 + 0.3,
        a: Math.random() * 0.6 + 0.4,
        tw: (Math.random() * 0.03 + 0.007) * (Math.random() > 0.5 ? 1 : -1),
        c: STAR_COLORS[(Math.random() * STAR_COLORS.length) | 0],
      }));
      return stars;
    };

    const nebulae = [
      { x: () => w * 0.75, y: () => h * 0.25, r: 320, c1: "rgba(147,51,234,0.10)" },
      { x: () => w * 0.18, y: () => h * 0.82, r: 380, c1: "rgba(251,191,36,0.08)" },
    ] as const;

    let stars = buildStars();
    let meteor: Meteor | null = null;
    let lastMeteor = performance.now();
    let last = performance.now();

    // --- draw helpers
    const drawBackground = () => {
      const gbg = ctx.createLinearGradient(0, 0, 0, h);
      gbg.addColorStop(0, "#06070c");
      gbg.addColorStop(1, "#0a0b14");
      ctx.fillStyle = gbg;
      ctx.fillRect(0, 0, w, h);
    };

    const drawNebulae = () => {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (const n of nebulae) {
        const x = n.x();
        const y = n.y();
        const ng = ctx.createRadialGradient(x, y, n.r * 0.1, x, y, n.r);
        ng.addColorStop(0, n.c1);
        ng.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = ng;
        ctx.beginPath();
        ctx.arc(x, y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const drawStars = () => {
      for (const s of stars) {
        s.a += s.tw;
        if (s.a > 1) { s.a = 1; s.tw *= -1; }
        if (s.a < 0.25) { s.a = 0.25; s.tw *= -1; }

        ctx.save();
        ctx.globalAlpha = s.a;
        ctx.fillStyle = s.c;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = s.a * 0.35;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    };

    const drawVignette = () => {
      const vg = ctx.createRadialGradient(
        w / 2, h / 2, Math.min(w, h) * 0.6,
        w / 2, h / 2, Math.max(w, h) * 0.85
      );
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.45)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);
    };

    const maybeSpawnMeteor = (t: number) => {
      if (!meteor && t - lastMeteor > meteorEvery) {
        lastMeteor = t;
        const startX = Math.random() * w * 0.7;
        const startY = -20;
        const speed = 1.2 + Math.random() * 0.8;
        meteor = { x: startX, y: startY, vx: speed, vy: speed * 0.38, life: 0, maxLife: 2200 };
      }
    };

    const drawMeteor = () => {
      if (!meteor) return;
      meteor.life += 16;

      const grad = ctx.createLinearGradient(meteor.x, meteor.y, meteor.x - 100, meteor.y - 36);
      grad.addColorStop(0, "rgba(255,255,255,0.9)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(meteor.x, meteor.y);
      ctx.lineTo(meteor.x - 100, meteor.y - 36);
      ctx.stroke();

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(meteor.x, meteor.y, 1.4, 0, Math.PI * 2);
      ctx.fill();

      meteor.x += meteor.vx;
      meteor.y += meteor.vy;
      if (meteor.x > w + 140 || meteor.y > h + 100 || meteor.life > meteor.maxLife) {
        meteor = null;
      }
    };

    // --- main loops
    const tick = (now: number) => {
      if (!runningRef.current) return;
      const dt = Math.min((now - last) / 16.67, 2);
      last = now;

      drawBackground();
      drawNebulae();
      drawStars();
      drawVignette();
      maybeSpawnMeteor(now);
      drawMeteor();

      rafRef.current = requestAnimationFrame(tick);
    };

    const drawOnceStatic = () => {
      drawBackground();
      drawNebulae();
      // sem twinkle, só usa alpha fixo
      for (const s of stars) {
        ctx.globalAlpha = s.a;
        ctx.fillStyle = s.c;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      drawVignette();
    };

    // --- listeners
    const onVisibility = () => {
      const hidden = document.visibilityState === "hidden";
      runningRef.current = !hidden;
      if (hidden && rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (!hidden && !prefersReduce && rafRef.current == null) {
        last = performance.now();
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    const onResize = () => {
      setSize();
      stars = buildStars();
      if (prefersReduce) drawOnceStatic();
    };

    document.addEventListener("visibilitychange", onVisibility, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    // --- start
    if (prefersReduce) {
      drawOnceStatic();
    } else {
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      runningRef.current = false;
    };
  }, [meteorEvery]);

  // FIX: fica ATRÁS de tudo; sem opacidade CSS (a opacidade vem das próprias estrelas/vinheta)
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none block"
      aria-hidden
    />
  );
}
