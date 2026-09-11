export default function GlobalLoading() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12" aria-busy="true" aria-label="Loading">
        <div className="h-9 w-64 bg-muted rounded animate-pulse mb-8" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 rounded-xl border border-border bg-card/50 animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-xl border border-border bg-card/50 animate-pulse" />
      </div>
    </main>
  )
}