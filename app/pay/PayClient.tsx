// components/pay/PayClient.tsx
"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { CARD } from "@/lib/ui";

/* utilitários */
const currency = (v: number, sym = "$") => `${sym}${Number(v ?? 0).toFixed(2)}`;
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

/* UI helpers */
const Card = ({ children, className = "" }: any) => <div className={`${CARD} ${className}`}>{children}</div>;
const CardBody = ({ children, className = "" }: any) => <div className={"p-5 " + className}>{children}</div>;
const Button = ({ children, onClick, className = "", type = "button" }: any) => (
  <button type={type} onClick={onClick} className={"inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2 text-sm " + className}>{children}</button>
);
const IconButton = ({ label, onClick, children }: any) => (
  <button title={label} onClick={onClick} className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-white/5 hover:bg-white/10">{children}</button>
);
const TextInput = ({ value, onChange, placeholder, type = "text", className = "", readOnly=false }: any) => (
  <input value={value} onChange={(e) => onChange?.(e.target.value)} placeholder={placeholder} type={type} readOnly={readOnly}
    className={"w-full rounded-xl bg-black/20 border border-white/10 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-white/20 " + className} />
);
const TextArea = ({ value, onChange, placeholder }: any) => (
  <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4}
    className="w-full rounded-xl bg-black/20 border border-white/10 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-white/20" />
);
const SearchBar = ({ value, onChange, placeholder }: any) => (
  <div className="flex items-center gap-3 rounded-2xl bg-black/20 border border-white/10 px-4 py-3">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/70">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
    <input className="w-full bg-transparent outline-none text-sm text-white/90 placeholder:text-white/50" placeholder={placeholder} value={value} onChange={(e)=>onChange(e.target.value)} />
  </div>
);

/* dados mock */
const MOCK_SALES = [
  { id: "pmt_01", desc: "BOT", amount: 16.16, currency: "BRL", payer: "Carlos Henrique", date: "26/09, 13:37", status: "APROVADA" },
  { id: "pmt_02", desc: "BOT", amount: 16.16, currency: "BRL", payer: "Carlos Hha", date: "26/09, 13:33", status: "ABERTA" },
];
const MOCK_LINKS = [ { id: "ppcYZCu4MdXmRHN93e", name: "BOT", amount: 3.0, currency: "USD", href: "https://onei.la/ToA" } ];

/* páginas (Home/Sales/Links/Criação/etc) — adaptado do seu projeto */
function HomePage({ onGoSales, onWithdraw }: any) {
  const [cur, setCur] = useState("USD");
  const [val, setVal] = useState(0);
  const varFeePct = 3.49, fixFee = 0.29, rate = cur === "USD" ? 1 : 5.2;
  const credited = clamp(val - (val * varFeePct / 100) - fixFee, 0, Infinity);

  return (
    <div className="space-y-6">
      <Card><CardBody>
        <div className="text-sm text-white/60">Vendas do mês</div>
        <div className="mt-2 text-3xl font-semibold">$3,00 <span className="text-white/60 text-base">USDT</span></div>
        <div className="mt-1 text-sm text-white/60">Vendas do mês passado $0,00</div>
        <div className="mt-5"><Button onClick={onGoSales}>Ver todas as vendas</Button></div>
      </CardBody></Card>

      <Card>
        <CardBody className="space-y-4">
          <h3 className="text-lg font-semibold">Calculadora</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select value={cur} onChange={(e)=>setCur(e.target.value)} className="rounded-xl bg-black/20 border border-white/10 px-3 py-2 text-sm"><option>USD 🇺🇸</option><option>BRL 🇧🇷</option></select>
            <TextInput type="number" value={val} onChange={(v:any)=>setVal(Number(v||0))} placeholder="$ 0" />
            <Button>Calcular</Button>
          </div>
          <div className="text-sm text-white/80 space-y-1">
            <div className="flex justify-between"><span>Taxa de câmbio USDT / {cur}</span><span>{cur==="USD"?"1.00":"1:"+rate}</span></div>
            <div className="flex justify-between"><span>Comissão por venda</span><span>{varFeePct}% + {currency(fixFee)}</span></div>
            <div className="flex justify-between"><span>Será creditado a você</span><span>{currency(credited)}</span></div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function SalesPage() {
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({ aprovadas: true, rejeitadas: true, devolvidas: true, expiradas: true, abertas: true });
  const filtered = useMemo(() => {
    return MOCK_SALES
      .filter((s) => s.desc.toLowerCase().includes(q.toLowerCase()) || s.payer.toLowerCase().includes(q.toLowerCase()))
      .filter((s)=>{ const map:any = { APROVADA: "aprovadas", REJEITADA: "rejeitadas", DEVOLVIDA: "devolvidas", EXPIRADA: "expiradas", ABERTA: "abertas" }; const k = map[s.status] || "abertas"; return (filters as any)[k]; });
  }, [q, filters]);
  const exportCsv = () => {
    const headers = ["id","descricao","montante","moeda","pagador","data","estado"]; 
    const rows = filtered.map(s => [s.id, s.desc, s.amount, s.currency, s.payer, s.date, s.status]);
    const csv = [headers.join(","), ...rows.map(r=>r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'vendas.csv'; a.click(); URL.revokeObjectURL(url);
  };
  const Toggle = ({label, checked, onChange}: any) => (
    <button onClick={()=>onChange(!checked)} className={`px-4 py-2 rounded-xl border text-sm ${checked? 'bg-white/10 border-white/10':'bg-black/10 border-white/10'}`}>{label} {checked && <span className="ml-1">✓</span>}</button>
  );
  return (
    <div className="space-y-6">
      <SearchBar value={q} onChange={setQ} placeholder="Buscar vendas" />
      <div className="flex flex-wrap items-center gap-3">
        <Toggle label="APROVADAS" checked={(filters as any).aprovadas} onChange={(v:any)=>setFilters(f=>({...f, aprovadas:v}))} />
        <Toggle label="REJEITADAS" checked={(filters as any).rejeitadas} onChange={(v:any)=>setFilters(f=>({...f, rejeitadas:v}))} />
        <Toggle label="DEVOLVIDAS" checked={(filters as any).devolvidas} onChange={(v:any)=>setFilters(f=>({...f, devolvidas:v}))} />
        <Toggle label="EXPIRADAS" checked={(filters as any).expiradas} onChange={(v:any)=>setFilters(f=>({...f, expiradas:v}))} />
        <Toggle label="ABERTAS" checked={(filters as any).abertas} onChange={(v:any)=>setFilters(f=>({...f, abertas:v}))} />
        <div className="ml-auto"><Button onClick={exportCsv}>Exportar minhas vendas ↓</Button></div>
      </div>
      <Card>
        <CardBody className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/60 border-b border-white/10">
                <th className="py-3 px-5">DESCRIÇÃO</th><th className="py-3 px-5">MONTANTE</th><th className="py-3 px-5">PAGADOR</th><th className="py-3 px-5">DATA</th><th className="py-3 px-5">ESTADO</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b last:border-0 border-white/10">
                  <td className="py-4 px-5">{s.desc}</td>
                  <td className="py-4 px-5">{currency(s.amount)} {s.currency}</td>
                  <td className="py-4 px-5">{s.payer}</td>
                  <td className="py-4 px-5">{s.date}</td>
                  <td className="py-4 px-5">{s.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}

function PaymentLinksPage({ onCreate }: any) {
  const [links, setLinks] = useState(MOCK_LINKS);
  const copy = (text: string) => navigator.clipboard.writeText(text);
  const remove = (id: string) => setLinks((l) => l.filter((x) => x.id !== id));
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Links de Pagamento</h2>
        <Button onClick={onCreate}>Criar Link de Pagamento ⚡</Button>
      </div>
      <Card>
        <CardBody className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/60 border-b border-white/10">
                <th className="py-3 px-5">NOME</th><th className="py-3 px-5">ID</th><th className="py-3 px-5">MONTANTE</th><th className="py-3 px-5 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {links.map((l) => (
                <tr key={l.id} className="border-b last:border-0 border-white/10">
                  <td className="py-4 px-5">{l.name}</td>
                  <td className="py-4 px-5 font-mono">{l.id}</td>
                  <td className="py-4 px-5">{currency(l.amount)} {l.currency}</td>
                  <td className="py-4 px-5">
                    <div className="flex items-center justify-end gap-2">
                      <IconButton label="Copiar" onClick={()=>copy(l.href)}>⎘</IconButton>
                      <IconButton label="Editar">✎</IconButton>
                      <IconButton label="Excluir" onClick={()=>remove(l.id)}>🗑</IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}

function CreatePaymentLinkPage() {
  const [title, setTitle] = useState("");
  const [currencySel, setCurrencySel] = useState("USD");
  const [amount, setAmount] = useState(0);
  const [desc, setDesc] = useState("");
  const [urlOk, setUrlOk] = useState("");
  const [urlErr, setUrlErr] = useState("");

  return (
    <div className="max-w-3xl space-y-6">
      <Card><CardBody className="space-y-4">
        <h3 className="text-lg font-semibold">Criar Link de Pagamento</h3>
        <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] gap-4 items-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-pink-500 via-orange-400 to-yellow-300" />
          <TextInput value={title} onChange={setTitle} placeholder="Título do produto/serviço" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select value={currencySel} onChange={(e)=>setCurrencySel((e.target as HTMLSelectElement).value)} className="rounded-xl bg-black/20 border border-white/10 px-3 py-2 text-sm"><option>USD 🇺🇸</option><option>BRL 🇧🇷</option></select>
          <TextInput type="number" value={amount} onChange={(v:any)=>setAmount(Number(v||0))} placeholder="$ 0" />
        </div>
        <TextArea value={desc} onChange={setDesc} placeholder="Descrição do seu produto ou serviço" />
      </CardBody></Card>

      <Card><CardBody className="space-y-3">
        <h4 className="text-sm font-semibold">Redirecionamento</h4>
        <TextInput value={urlOk} onChange={setUrlOk} placeholder="URL de sucesso" />
        <TextInput value={urlErr} onChange={setUrlErr} placeholder="URL de erro" />
        <div className="flex items-center gap-3">
          <Button>Salvar</Button>
          <Button className="bg-white/0 border border-white/10">← Voltar</Button>
        </div>
      </CardBody></Card>
    </div>
  );
}

/* roteador local do módulo Pay */
const routes = [
  { key: "home", label: "Início" },
  { key: "sales", label: "Vendas" },
  { key: "links", label: "Links" },
  { key: "linkCreate", label: "Criar Link", hidden: true },
];

export default function PayClient() {
  const [route, setRoute] = useState("home");
  return (
    <div className="space-y-4">
      {/* Tabs superiores */}
      <div className={`${CARD} p-2 flex items-center gap-2 overflow-auto`}>
        {routes.filter(r=>!r.hidden).map(r=>(
          <button key={r.key}
            onClick={()=>setRoute(r.key)}
            className={`px-3 py-1.5 rounded-lg text-sm ${route===r.key ? "bg-white/10" : "hover:bg-white/5"}`}
          >
            {r.label}
          </button>
        ))}
        <div className="ml-auto text-xs text-white/60 px-2">GalaxyFi Pay</div>
      </div>

      {/* Conteúdo */}
      {route === "home" && <HomePage onGoSales={()=>setRoute("sales")} onWithdraw={()=>setRoute("home")} />}
      {route === "sales" && <SalesPage />}
      {route === "links" && <PaymentLinksPage onCreate={()=>setRoute("linkCreate")} />}
      {route === "linkCreate" && <CreatePaymentLinkPage />}
    </div>
  );
}
