import { Card, CardContent } from '@/components/ui/Card'

export default function TripDetailLoading() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="h-10 w-32 bg-muted animate-pulse rounded mb-6" aria-hidden="true" />
        <div className="h-8 w-64 bg-muted animate-pulse rounded mb-4" aria-hidden="true" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="h-24 bg-muted animate-pulse rounded" aria-hidden="true" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="h-24 bg-muted animate-pulse rounded" aria-hidden="true" />
            </CardContent>
          </Card>
        </div>
        <p className="sr-only">Loading trip…</p>
      </div>
    </main>
  )
}
