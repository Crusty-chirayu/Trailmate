'use client'

import { useState } from 'react'
import { createClient, mapAuthError, isSupabaseConfigured } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mountain, ArrowRight, KeyRound } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const configured = isSupabaseConfigured()

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) throw error

      setMessage('Password updated. Redirecting you into the app...')

      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? mapAuthError(err.message) : mapAuthError(undefined))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-emerald-900/30 via-background to-background items-center justify-center p-12">
        <div className="max-w-md space-y-8">
          <Link href="/" className="flex items-center gap-3 group">
            <Mountain className="h-10 w-10 text-primary transition-transform group-hover:scale-110" />
            <span className="text-3xl font-bold tracking-tight">TrailMate</span>
          </Link>
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold leading-relaxed">
              Set a new key.<br />
              <span className="text-emerald-400">Then get back outside.</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Your reset link has been verified. Choose a new password — your
              existing trips, routes, and gear stay exactly as they were.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            <span>Password Recovery</span>
            <div className="h-px flex-1 bg-border" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <Link href="/" className="lg:hidden flex items-center gap-2 group">
            <Mountain className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold tracking-tight">TrailMate</span>
          </Link>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Choose a new password</h1>
            <p className="text-muted-foreground">Your reset link has been verified</p>
          </div>

          {!configured && (
            <div className="p-4 text-sm text-amber-600 bg-amber-500/10 rounded-xl border border-amber-500/20" role="status">
              This app is not connected to its backend (Supabase). The deployment
              is missing real Supabase credentials — see the README
              &quot;Supabase setup&quot; section. Nothing was sent.
            </div>
          )}

          {error && (
            <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-xl border border-destructive/20" role="alert">
              {error}
            </div>
          )}

          {message && (
            <div className="p-4 text-sm text-emerald-500 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-start gap-3" role="status">
              <KeyRound className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">
                New password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="h-11"
                placeholder="••••••••"
                aria-describedby="password-hint"
              />
              <p id="password-hint" className="text-xs text-muted-foreground">At least 6 characters.</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm" className="block text-sm font-medium">
                Confirm new password
              </label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="h-11"
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" size="lg" className="w-full font-semibold" disabled={loading}>
              {loading ? 'Updating password...' : 'Update Password'}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}