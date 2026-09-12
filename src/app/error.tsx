'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Server-side error logging — the digest lets operators correlate the
    // user-visible message with server logs.
    console.error('Unhandled application error:', error.digest ?? error.message)
  }, [error])

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="text-center py-20">
        <AlertTriangle className="h-16 w-16 text-destructive-text mx-auto mb-6" aria-hidden="true" />
        <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">Something went wrong</p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Unexpected error</h1>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          An unexpected error interrupted this page. Your recorded data is safe. You can retry, or return to the
          dashboard.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try again
          </Button>
          <Button href="/dashboard" variant="outline">
            Go to Dashboard
          </Button>
        </div>
      </div>
    </main>
  )
}