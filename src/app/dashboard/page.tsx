import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TripService } from '@/lib/domain/trips/service'
import { TripAnalyticsService } from '@/lib/domain/tracking/analyticsService'
import {
  computeTripAnalytics,
  emptyTripAnalytics,
  summarizeByActivity,
  type TripActivityRecord,
  type TripAnalytics,
  type ActivitySummary,
  type AnalyticsWindow,
} from '@/lib/domain/tracking/analytics'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Mountain, MapPin, Calendar, Plus, Route } from 'lucide-react'
import Link from 'next/link'
import { formatDistance, formatElevation, formatTime } from '@/lib/tracking/format'
import type { Trip } from '@/types/domain'

const WINDOW_LABELS: Record<string, string> = {
  '7': 'last 7 days',
  '30': 'last 30 days',
  '90': 'last 90 days',
  '365': 'last year',
  all: 'all time',
}

function parseWindowParam(value: string | undefined): AnalyticsWindow {
  switch (value) {
    case '7': return { days: 7 }
    case '90': return { days: 90 }
    case '365': return { days: 365 }
    case 'all': return 'all'
    case '30':
    default: return { days: 30 }
  }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ window?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { window: windowParam } = await searchParams
  const window = parseWindowParam(windowParam)
  const windowLabel = WINDOW_LABELS[window === 'all' ? 'all' : String(window.days)]
  const referenceDate = new Date()

  let records: TripActivityRecord[] = []
  let analytics: TripAnalytics = emptyTripAnalytics()
  let trips: TripSummaryRow[] = []
  let allTrips: Trip[] = []
  let analyticsAvailable = false
  let activitySummaries: ActivitySummary[] = []
  let allTime = emptyTripAnalytics()

  try {
    allTrips = await TripService.getAllTrips()
    trips = allTrips.slice(0, 3).map(t => ({
      id: t.id,
      title: t.title,
      status: t.status,
      activityType: t.activityType,
      plannedDate: t.plannedDate,
    }))
  } catch (error) {
    if (error instanceof Error && error.message === 'User not authenticated') redirect('/login')
    console.error('Failed to load recent trips:', error)
  }

  try {
    records = await TripAnalyticsService.getTripActivityRecords(allTrips)
    analytics = computeTripAnalytics(records, { window, referenceDate })
    allTime = computeTripAnalytics(records, { window: 'all', referenceDate })
    activitySummaries = summarizeByActivity(records, { window, referenceDate })
    analyticsAvailable = true
  } catch (error) {
    console.error('Failed to compute analytics:', error)
  }

  const hasAnyData = analytics.totalTrips > 0

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <header className="mb-8 sm:mb-12">
          <p className="text-sm text-muted-foreground mb-1">Welcome back</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Expedition Log</h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Distance, time and elevation — measured only from your recorded routes, never estimated.
          </p>
        </header>

        {!analyticsAvailable ? (
          <LoadingState />
        ) : !hasAnyData ? (
          <EmptyExpeditionLog />
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {['7', '30', '90', '365', 'all'].map((w) => (
                <Link
                  key={w}
                  href={`/dashboard?window=${w}`}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    (windowParam ?? '30') === w
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {WINDOW_LABELS[w]}
                </Link>
              ))}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
              <StatCard
                label="Total trips"
                value={String(analytics.totalTrips)}
                detail={<StatusLine analytics={analytics} />}
              />
              <StatCard
                label="Distance"
                value={analytics.tripsWithRoute > 0 ? formatDistance(analytics.totalDistance) : '0 m'}
                detail={analytics.tripsWithRoute > 0
                  ? `${analytics.tripsWithRoute} recorded ${analytics.tripsWithRoute === 1 ? 'route' : 'routes'}`
                  : 'no recorded routes'}
              />
              <StatCard
                label="Moving time"
                value={formatTime(analytics.totalMovingTime)}
                detail={analytics.hasElevation
                  ? `+${formatElevation(analytics.totalElevationGain)} gain`
                  : windowLabel}
              />
              <StatCard
                label="Elevation"
                value={analytics.hasElevation ? `+${formatElevation(analytics.totalElevationGain)}` : '—'}
                detail={analytics.hasElevation
                  ? `${formatElevation(analytics.totalElevationLoss)} descent`
                  : 'no altitude data'}
              />
            </div>

            {analytics.totalTrips > 0 && (
              <p className="mb-8 text-sm text-muted-foreground leading-relaxed">
                <StatusLine analytics={analytics} />
                {analytics.tripsWithRoute > 0 && analytics.averageTripDistance !== null && (
                  <> · average trip {formatDistance(analytics.averageTripDistance)}</>
                )}
                {allTime.longestTrip && (
                  <> · longest: <Link href={`/trips/${allTime.longestTrip.tripId}`} className="text-foreground font-medium underline underline-offset-4 hover:text-primary">{allTime.longestTrip.title}</Link> {formatDistance(allTime.longestTrip.distance)}</>
                )}
              </p>
            )}

            {activitySummaries.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  By activity · {windowLabel}
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {activitySummaries.map((s) => (
                    <div key={s.activityType} className="rounded-xl border border-border bg-card/50 p-4">
                      <div className="text-sm font-medium mb-1">{s.activityType}</div>
                      <div className="text-lg font-bold">{formatDistance(s.totalDistance)}</div>
                      <div className="text-xs text-muted-foreground">{s.tripCount} trips · {s.tripsWithRoute} with route</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {allTime.longestTrip && (
              <section className="mb-8">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  Personal records · all time
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Link href={`/trips/${allTime.longestTrip.tripId}`} className="rounded-xl border border-border bg-card/50 p-4 hover:bg-accent/50 transition-colors">
                    <div className="text-sm text-muted-foreground mb-1">Longest distance</div>
                    <div className="text-lg font-bold">{formatDistance(allTime.longestTrip.distance)}</div>
                    <div className="text-xs text-muted-foreground">{allTime.longestTrip.title}</div>
                  </Link>
                  {allTime.largestAscent && (
                    <Link href={`/trips/${allTime.largestAscent.tripId}`} className="rounded-xl border border-border bg-card/50 p-4 hover:bg-accent/50 transition-colors">
                      <div className="text-sm text-muted-foreground mb-1">Largest ascent</div>
                      <div className="text-lg font-bold">+{formatElevation(allTime.largestAscent.elevationGain)}</div>
                      <div className="text-xs text-muted-foreground">{allTime.largestAscent.title}</div>
                    </Link>
                  )}
                  {allTime.longestMovingTime && (
                    <Link href={`/trips/${allTime.longestMovingTime.tripId}`} className="rounded-xl border border-border bg-card/50 p-4 hover:bg-accent/50 transition-colors">
                      <div className="text-sm text-muted-foreground mb-1">Longest moving time</div>
                      <div className="text-lg font-bold">{formatTime(allTime.longestMovingTime.movingSeconds)}</div>
                      <div className="text-xs text-muted-foreground">{allTime.longestMovingTime.title}</div>
                    </Link>
                  )}
                  {allTime.highestElevation && (
                    <Link href={`/trips/${allTime.highestElevation.tripId}`} className="rounded-xl border border-border bg-card/50 p-4 hover:bg-accent/50 transition-colors">
                      <div className="text-sm text-muted-foreground mb-1">Highest elevation</div>
                      <div className="text-lg font-bold">{formatElevation(allTime.highestElevation.elevation)}</div>
                      <div className="text-xs text-muted-foreground">{allTime.highestElevation.title}</div>
                    </Link>
                  )}
                </div>
              </section>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Plus className="h-5 w-5" />
                    New Trip
                  </CardTitle>
                  <CardDescription>Plan your next outdoor adventure</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/trips/new" className="block">
                    <Button className="w-full">Create Trip</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Route className="h-5 w-5 text-emerald-500" />
                    Routes
                  </CardTitle>
                  <CardDescription>View and manage your recorded routes</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/trips" className="block">
                    <Button variant="outline" className="w-full">Browse Trips</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Mountain className="h-5 w-5 text-purple-500" />
                    Gear
                  </CardTitle>
                  <CardDescription>Manage your equipment and packing lists</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/gear" className="block">
                    <Button variant="outline" className="w-full">Manage Gear</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {trips.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Recent adventures</h2>
                  <Link href="/trips">
                    <Button variant="ghost" size="sm">View all</Button>
                  </Link>
                </div>
                <div className="space-y-3">
                  {trips.map((trip) => (
                    <Link
                      key={trip.id}
                      href={`/trips/${trip.id}`}
                      className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/50 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold truncate">{trip.title}</h3>
                          <Badge variant={
                            trip.status === 'active' ? 'success' :
                            trip.status === 'planned' ? 'warning' :
                            trip.status === 'completed' ? 'default' : 'destructive'
                          }>
                            {trip.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {trip.activityType}
                          </span>
                          {trip.plannedDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(trip.plannedDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-9 px-3 cursor-pointer transition-colors">View</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  )
}

interface TripSummaryRow {
  id: string
  title: string
  status: string
  activityType: string
  plannedDate?: Date
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-48 bg-muted rounded animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-28 bg-muted rounded animate-pulse" />
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, value, detail }: { label: string; value: string; detail?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-4 sm:p-5">
      <dt className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{label}</dt>
      <dd>
        <span className="block text-2xl sm:text-3xl font-bold tabular-nums tracking-tight">{value}</span>
        <span className="block text-xs text-muted-foreground mt-1">{detail}</span>
      </dd>
    </div>
  )
}

function StatusLine({ analytics }: { analytics: TripAnalytics }) {
  const parts: string[] = []
  if (analytics.completedTrips > 0) parts.push(`${analytics.completedTrips} completed`)
  if (analytics.activeTrips > 0) parts.push(`${analytics.activeTrips} active`)
  if (analytics.plannedTrips > 0) parts.push(`${analytics.plannedTrips} planned`)
  if (analytics.cancelledTrips > 0) parts.push(`${analytics.cancelledTrips} cancelled`)
  if (parts.length === 0) return null
  return <>{parts.join(' · ')}</>
}

function EmptyExpeditionLog() {
  return (
    <section aria-labelledby="empty-log-heading" className="mb-8">
      <div className="rounded-md border border-dashed border-border p-10 sm:p-14 text-center">
        <Mountain className="h-14 w-14 text-muted-foreground mx-auto mb-4" />
        <h2 id="empty-log-heading" className="text-lg font-semibold mb-2">
          No expeditions logged yet
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          Plan a trip and record a GPS route — your distance, moving time and
          elevation will appear here, measured from real recorded data.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button href="/trips/new">
            <Plus className="h-4 w-4 mr-2" />
            Plan Your First Trip
          </Button>
          <Button href="/trips" variant="outline">
            <Route className="h-4 w-4 mr-2" />
            Browse Trips
          </Button>
        </div>
      </div>
    </section>
  )
}



