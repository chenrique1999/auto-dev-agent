// components/NavLink.tsx
"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  href: string;
  className?: string;
  children: React.ReactNode;
  "aria-current"?: "page" | false;
};

export default function NavLink({ href, className = "", children, ...rest }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const onMouseEnter = () => {
    // prefetch explícito (além do prefetch automático em viewport)
    router.prefetch(href);
  };

  const onClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    // deixa a UI livre enquanto dispara a nav
    startTransition(() => {
      // o <Link> já faz push; não precisamos chamar router.push aqui
    });
  };

  return (
    <Link
      href={href}
      prefetch
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      className={className}
      {...rest}
    >
      {children}
    </Link>
  );
}
