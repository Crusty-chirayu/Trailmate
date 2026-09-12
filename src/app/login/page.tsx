'use client'

import { useState, useMemo, Suspense } from 'react'
import { createClient, mapAuthError, isSupabaseConfigured } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mountain, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])
  const configured = isSupabaseConfigured()

  // Auth-link failures from /auth/callback (expired links, auth errors from
  // Supabase) land here as ?authError=... — show them instead of failing silently.
  const linkError = searchParams.get('authError')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? mapAuthError(error.message) : mapAuthError(undefined))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-emerald-900/30 via-background to-background items-center justify-center p-12">
        <div className="max-w-md space-y-8">
          <Link href="/" className="flex items-center gap-3 group">
            <Mountain className="h-10 w-10 text-primary transition-transform group-hover:scale-110" />
            <span className="text-3xl font-bold tracking-tight">TrailMate</span>
          </Link>
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold leading-relaxed">
              Plan the journey.<br />
              <span className="text-emerald-400">Live the trail.</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Track GPS routes in real time, manage gear, analyze your progress,
              and share your outdoor adventures.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            <span>Outdoor Adventure Platform</span>
            <div className="h-px flex-1 bg-border" />
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center gap-2 group">
            <Mountain className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold tracking-tight">TrailMate</span>
          </Link>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to your TrailMate account</p>
          </div>

          {!configured && (
            <div className="p-4 text-sm text-amber-600 bg-amber-500/10 rounded-xl border border-amber-500/20" role="status">
              {isSupabaseConfigured() ? null : (
                'This app is not connected to its backend (Supabase). The deployment is missing real Supabase credentials — see the README "Supabase setup" section.'
              )}
            </div>
          )}

          {(linkError || error) && (
            <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-xl border border-destructive/20" role="alert">
              {error ?? mapAuthError(linkError ?? undefined)}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-11"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="h-11"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-end">
              <Link href="/reset-password" className="text-sm font-medium text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" size="lg" className="w-full font-semibold" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" role="status">Loading…</div>}>
      <LoginForm />
    </Suspense>
  )
}
