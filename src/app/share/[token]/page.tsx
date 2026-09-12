import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { TripShareService } from '@/lib/domain/trips/sharing'
import TrailView from '@/components/trails/TrailView'
import type { RouteHistoryPoint } from '@/lib/domain/tracking/routeStats'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params
  return { title: 'Shared trail — TrailMate', description: `Shared trail ${token.slice(0, 8)}` }
}

/**
 * Bearer-token trail page for `visibility = 'shared'` trips.
 *
 * Authenticated visitors only: the migration grants the `get_shared_trip` /
 * `get_shared_route` RPCs to the authenticated role, and the service calls
 * them with the visitor's session. Unknown, revoked, or cancelled-trip tokens
 * render the shared 404 (fail closed, no existence oracle beyond the generic
 * not-found page shared by every missing route).
 */
export default async function SharedTrailPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let trip: Awaited<ReturnType<typeof TripShareService.getSharedTrip>>
  let rawPoints: Awaited<ReturnType<typeof TripShareService.getSharedRoute>>
  try {
    trip = await TripShareService.getSharedTrip(token)
    if (!trip) notFound()
    rawPoints = await TripShareService.getSharedRoute(token)
  } catch {
    notFound()
  }
  const route: RouteHistoryPoint[] = rawPoints.map(p => ({
    lat: p.lat,
    lng: p.lng,
    elevation: p.elevation ?? undefined,
    recordedAt: new Date(p.recordedAt),
  }))

  return (
    <TrailView
      profile={{
        id: trip.id,
        title: trip.title,
        description: trip.description,
        activityType: trip.activityType,
        difficulty: trip.difficulty,
        status: trip.status,
        plannedDate: trip.plannedDate,
        startDate: trip.startDate,
        endDate: trip.endDate,
        estimatedDistance: trip.estimatedDistance,
        estimatedElevationGain: trip.estimatedElevationGain,
        estimatedDuration: trip.estimatedDuration,
      }}
      route={route}
      backHref="/"
      backLabel="TrailMate"
      channelLabel="Shared trail"
    />
  )
}
