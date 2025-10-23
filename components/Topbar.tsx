// components/Topbar.tsx
"use client";

import React from "react";
import { Bell, Settings, User, LogOut } from "lucide-react";
// import LogoGALAXIFY from "@/components/icons/LogoGALAXIFY"; // removido daqui

const H = "h-10";

type IconBtnProps = {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
};

const IconBtn = ({ label, onClick, children, className = "" }: IconBtnProps) => (
  <button
    aria-label={label}
    title={label}
    onClick={onClick}
    className={`${H} w-10 rounded-xl grid place-items-center bg-white/5 hover:bg-white/10 ${className}`}
  >
    {children}
  </button>
);

export default function Topbar() {
  const [openNotif, setOpenNotif] = React.useState(false);
  const [openUser, setOpenUser] = React.useState(false);

  const notifRef = React.useRef<HTMLDivElement | null>(null);
  const userRef = React.useRef<HTMLDivElement | null>(null);

  const [notifs, setNotifs] = React.useState([
    { id: "n1", t: "Webhook de WA conectado", when: "há 2m", unread: true },
    { id: "n2", t: "LP publicada em galaxify.link/alpha", when: "há 25m", unread: true },
    { id: "n3", t: "Checkout Pay habilitado", when: "ontem", unread: false },
  ]);
  const unread = notifs.some(n => n.unread);
  const markAll = () => setNotifs(v => v.map(n => ({ ...n, unread: false })));

  React.useEffect(() => {
    const hasOpen = openNotif || openUser;
    if (!hasOpen) return;

    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (openNotif && notifRef.current && !notifRef.current.contains(t)) setOpenNotif(false);
      if (openUser && userRef.current && !userRef.current.contains(t)) setOpenUser(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (openNotif) setOpenNotif(false);
        if (openUser) setOpenUser(false);
      }
    };

    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onEsc);
    };
  }, [openNotif, openUser]);

  return (
    <header className="relative z-50 isolate py-3 mb-4">
      <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-3">
        <div /> {/* spacer esquerdo */}

        {/* lugar onde a logo ficava — mantemos altura para preservar o espaçamento do topo */}
        <div className="justify-self-center h-[44px]" />

        {/* ações à direita (inalteradas) */}
        <div className="justify-self-end flex items-center gap-2">
          <div className="relative" ref={notifRef}>
            <IconBtn label="Notificações" onClick={() => setOpenNotif(v => !v)}>
              <div className="relative">
                <Bell className="w-4 h-4 text-white/80" />
                {unread && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />}
              </div>
            </IconBtn>
            {openNotif && (
              <div
                className="absolute right-0 mt-2 w-[320px] rounded-xl bg-[#0a0a0f]/95 backdrop-blur border border-white/10 shadow-xl z-[60]"
                role="menu" aria-label="Notificações"
              >
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="text-sm font-medium">Notificações</div>
                  <button onClick={markAll} className="text-[12px] text-white/60 hover:text-white/80">Marcar como lidas</button>
                </div>
                <div className="max-h-[320px] overflow-auto">
                  {notifs.map(n => (
                    <div key={n.id} className="px-3 py-2 border-t border-white/5 first:border-0">
                      <div className="text-[13px] text-white/90">{n.t}</div>
                      <div className="text-[11px] text-white/50">{n.when}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={userRef}>
            <IconBtn label="Conta" onClick={() => setOpenUser(v => !v)}>
              <div className="w-5 h-5 grid place-items-center rounded-full bg-white/80 text-[#0a0a0f] text-[11px] font-bold">N</div>
            </IconBtn>

            {openUser && (
              <div
                className="absolute right-0 mt-2 w-[200px] rounded-xl bg-[#0a0a0f]/95 backdrop-blur border border-white/10 shadow-xl py-1 z-[70]"
                role="menu" aria-label="Conta"
              >
                <a href="/settings" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5">
                  <Settings className="w-4 h-4 text-white/70" /> Configurações
                </a>
                <a href="/profile" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5">
                  <User className="w-4 h-4 text-white/70" /> Perfil
                </a>
                <button className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5">
                  <LogOut className="w-4 h-4 text-white/70" /> Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
