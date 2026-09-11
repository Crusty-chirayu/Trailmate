import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { MapPin } from 'lucide-react'

export default function TripNotFound() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Card>
          <CardHeader className="text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" aria-hidden="true" />
            <CardTitle>Trip not found</CardTitle>
            <CardDescription>This trip does not exist or you do not have access to it.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-3">
            <Button href="/trips">Back to trips</Button>
            <Button href="/trips/new" variant="outline">Create a trip</Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
