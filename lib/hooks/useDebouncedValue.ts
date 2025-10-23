// lib/hooks/useDebouncedValue.ts
"use client";

import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delay = 180) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}
