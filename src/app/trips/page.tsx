import { TripService } from '@/lib/domain/trips/service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Mountain, MapPin, Calendar, Plus, Route, Clock } from 'lucide-react'
import { formatDistance } from '@/lib/tracking/format'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function TripsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; activity?: string; search?: string }>
}) {
  const { status, activity, search } = await searchParams
  const trips = await TripService.getAllTrips()

  // Server-validated filtering — only known enum values participate
  const filteredTrips = trips.filter(trip => {
    if (status && ['planned', 'active', 'completed', 'cancelled'].includes(status) && trip.status !== status) return false
    if (activity && ['trekking', 'cycling', 'camping', 'other'].includes(activity) && trip.activityType !== activity) return false
    if (search && !trip.title.toLowerCase().includes(search.toLowerCase().trim())) return false
    return true
  })

  const statusCounts = {
    total: trips.length,
    planned: trips.filter(t => t.status === 'planned').length,
    active: trips.filter(t => t.status === 'active').length,
    completed: trips.filter(t => t.status === 'completed').length,
    cancelled: trips.filter(t => t.status === 'cancelled').length,
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">Your Adventures</h1>
            <p className="text-muted-foreground">
              Manage your outdoor trips and expeditions
            </p>
          </div>
          <Link href="/trips/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Trip
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          <div className="rounded-xl border border-border bg-card/50 p-4">
            <div className="text-2xl font-bold tabular-nums">{statusCounts.total}</div>
            <div className="text-xs text-muted-foreground mt-1">Total</div>
          </div>
          <div className="rounded-xl border border-border bg-card/50 p-4">
            <div className="text-2xl font-bold tabular-nums text-amber-400">{statusCounts.planned}</div>
            <div className="text-xs text-muted-foreground mt-1">Planned</div>
          </div>
          <div className="rounded-xl border border-border bg-card/50 p-4">
            <div className="text-2xl font-bold tabular-nums text-emerald-400">{statusCounts.active}</div>
            <div className="text-xs text-muted-foreground mt-1">Active</div>
          </div>
          <div className="rounded-xl border border-border bg-card/50 p-4">
            <div className="text-2xl font-bold tabular-nums text-emerald-500">{statusCounts.completed}</div>
            <div className="text-xs text-muted-foreground mt-1">Completed</div>
          </div>
          <div className="rounded-xl border border-border bg-card/50 p-4">
            <div className="text-2xl font-bold tabular-nums text-destructive">{statusCounts.cancelled}</div>
            <div className="text-xs text-muted-foreground mt-1">Cancelled</div>
          </div>
        </div>

        {/* Filters — URL-driven, refresh-safe, shareable */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form method="get" className="flex flex-col md:flex-row gap-4" role="search" aria-label="Filter trips">
              <div className="flex-1">
                <label htmlFor="search" className="sr-only">Search trips</label>
                <Input
                  id="search"
                  name="search"
                  placeholder="Search trips..."
                  defaultValue={search ?? ''}
                  className="max-w-sm"
                  aria-label="Search trips"
                />
              </div>
              <div className="flex gap-2">
                <label htmlFor="status" className="sr-only">Filter by status</label>
                <select
                  id="status"
                  name="status"
                  className="px-4 py-2 rounded-md border border-input bg-background text-sm"
                  defaultValue={status ?? ''}
                  aria-label="Filter by status"
                >
                  <option value="">All Status</option>
                  <option value="planned">Planned</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <label htmlFor="activity" className="sr-only">Filter by activity</label>
                <select
                  id="activity"
                  name="activity"
                  className="px-4 py-2 rounded-md border border-input bg-background text-sm"
                  defaultValue={activity ?? ''}
                  aria-label="Filter by activity"
                >
                  <option value="">All Activities</option>
                  <option value="trekking">Trekking</option>
                  <option value="cycling">Cycling</option>
                  <option value="camping">Camping</option>
                  <option value="other">Other</option>
                </select>
                <Button type="submit" variant="outline" size="sm" aria-label="Apply filters">Filter</Button>
                {(search || status || activity) && (
                  <Button href="/trips" variant="ghost" size="sm" aria-label="Clear filters">Clear</Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Trip List */}
        {filteredTrips.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <Mountain className="h-14 w-14 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No trips found</h3>
            <p className="text-muted-foreground mb-6">
              {trips.length === 0
                ? "Start planning your first outdoor adventure"
                : "Try adjusting your filters or search terms"}
            </p>
            {trips.length === 0 && (
              <Link href="/trips/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Trip
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTrips.map((trip) => (
              <Link key={trip.id} href={`/trips/${trip.id}`} className="block">
                <div className="rounded-xl border border-border bg-card/50 p-5 hover:border-primary/30 hover:bg-card transition-all group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{trip.title}</h3>
                        <Badge variant={
                          trip.status === 'active' ? 'success' :
                          trip.status === 'planned' ? 'warning' :
                          trip.status === 'completed' ? 'default' : 'destructive'
                        }>
                          {trip.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {trip.activityType}
                        </span>
                        {trip.plannedDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(trip.plannedDate).toLocaleDateString()}
                          </span>
                        )}
                        {trip.estimatedDistance && (
                          <span className="flex items-center gap-1">
                            <Route className="h-3.5 w-3.5" />
                            {formatDistance(trip.estimatedDistance)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 shrink-0">
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                        View
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
