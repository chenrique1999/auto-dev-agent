// app/.../loading.tsx
export default function Loading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-40 rounded-2xl bg-white/5" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-48 rounded-2xl bg-white/5" />
        <div className="h-48 rounded-2xl bg-white/5" />
      </div>
      <div className="h-64 rounded-2xl bg-white/5" />
    </div>
  );
}
