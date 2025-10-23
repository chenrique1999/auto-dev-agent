"use client";

type Method = { name: string; percent: number };

export default function MethodsGrid({ methods }: { methods: Method[] }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {methods.map((m) => (
        <div key={m.name} className="rounded-2xl bg-white/5 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm">{m.name}</p>
            <span className="text-xs text-white/60">{m.percent}%</span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-white/10">
            <div
              className="h-2 rounded-full bg-white/60"
              style={{ width: `${m.percent}%` }}
            />
          </div>
        </div>
      ))}
    </section>
  );
}
