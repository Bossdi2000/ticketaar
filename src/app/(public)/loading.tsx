export default function Loading() {
  return (
    <div className="container-page py-10" aria-busy="true" aria-label="Loading">
      <div className="h-6 w-40 animate-pulse rounded-lg bg-pink-500/10" />
      <div className="mt-3 h-9 w-64 animate-pulse rounded-xl bg-pink-500/10" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-72 animate-pulse rounded-2xl bg-pink-500/5 shadow-glow"
          />
        ))}
      </div>
    </div>
  );
}
