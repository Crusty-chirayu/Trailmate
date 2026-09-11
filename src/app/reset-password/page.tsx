'use client'

import { useState } from 'react'
import { createClient, mapAuthError, isSupabaseConfigured } from '@/lib/supabase/client'
import Link from 'next/link'
import { Mountain, ArrowRight, Mail } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const supabase = createClient()
  const configured = isSupabaseConfigured()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      })

      if (error) throw error

      setMessage(
        `If an account exists for ${email}, a password reset link is on its way. Check your inbox and spam folder.`
      )
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
              Lost the key?<br />
              <span className="text-emerald-400">Back on the trail shortly.</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We&apos;ll email you a secure link to set a new password. The link
              works once and expires — nothing else changes.
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
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Reset your password</h1>
            <p className="text-muted-foreground">Enter your account email and we&apos;ll send a reset link</p>
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
              <Mail className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleReset} className="space-y-5">
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

            <Button type="submit" size="lg" className="w-full font-semibold" disabled={loading}>
              {loading ? 'Sending reset link...' : 'Send Reset Link'}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          <div className="flex justify-between text-sm">
            <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
              ← Back to sign in
            </Link>
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}