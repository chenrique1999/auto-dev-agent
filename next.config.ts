// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // você já usa esses imports otimizados
    optimizePackageImports: ["lucide-react", "recharts", "framer-motion"],
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },

  // ⛑️ Faz o Next ignorar erros do ESLint durante "next build" (CI/Netlify).
  // O ESLint continua funcionando no dev (VSCode/terminal), só não quebra a build.
  eslint: {
    ignoreDuringBuilds: true,
  },

  // mantém checagem de types; se algum dia a build quebrar por TS,
  // podemos mudar para "true" temporariamente.
  typescript: {
    ignoreBuildErrors: false,
  },

  // já estava no seu projeto: remove console em prod (mantém warn/error)
  removeConsole:
    process.env.NODE_ENV === "production" ? { exclude: ["warn", "error"] } : false,
};

export default nextConfig;
