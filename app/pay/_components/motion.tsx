"use client";

import { motion } from "framer-motion";

// Exporta o objeto `motion` como `Motion` para usar <Motion.div />, <Motion.span /> etc.
export const Motion = motion;

// (opcional) exports de variantes reutilizáveis
export const fadeInUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.22, ease: "easeOut" },
};
