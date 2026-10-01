export default function Loading() {
  return (
    <div className="pt-10 space-y-6" aria-busy="true">
      <div className="h-12 w-64 rounded-full bg-white/70 animate-pulse" />
      <div className="card h-40 animate-pulse" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card h-56 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
