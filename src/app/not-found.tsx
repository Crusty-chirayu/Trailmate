import Link from 'next/link'
import { Mountain, Compass } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="text-center py-20">
        <Mountain className="h-16 w-16 text-muted-foreground mx-auto mb-6" aria-hidden="true" />
        <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">Off the map</p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Page not found</h1>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          The page you were looking for doesn&rsquo;t exist. It may have been moved, or the trail ends here.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button href="/">
            <Compass className="h-4 w-4 mr-2" />
            Back to Basecamp
          </Button>
          <Link
            href="/trips"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background h-10 py-2 px-4 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
          >
            View Trips
          </Link>
        </div>
      </div>
    </main>
  )
}