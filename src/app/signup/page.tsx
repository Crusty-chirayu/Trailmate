'use client'

import { useState } from 'react'
import { createClient, mapAuthError } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mountain, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      // When email confirmation is disabled, Supabase returns an active
      // session immediately — send the user into the app instead of telling
      // them to check their inbox.
      if (data?.session) {
        router.push('/dashboard')
        router.refresh()
        return
      }

      setMessage('Check your email for the confirmation link!')
    } catch (error) {
      setError(error instanceof Error ? mapAuthError(error.message) : mapAuthError(undefined))
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
            <h2 className="text-2xl font-semibold leading-relaxed">Start your<br /><span className="text-emerald-400">adventure today.</span></h2>
            <p className="text-muted-foreground leading-relaxed">Plan trips, track GPS routes, manage gear, and analyze your outdoor progress.</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="h-px flex-1 bg-border" /><span>Free & open source</span><div className="h-px flex-1 bg-border" />
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <Link href="/" className="lg:hidden flex items-center gap-2 group"><Mountain className="h-7 w-7 text-primary" /><span className="text-xl font-bold tracking-tight">TrailMate</span></Link>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Create your account</h1>
            <p className="text-muted-foreground">Start planning your outdoor adventures</p>
          </div>
          {error && <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-xl border border-destructive/20" role="alert">{error}</div>}
          {message && <div className="p-4 text-sm text-emerald-500 bg-emerald-500/10 rounded-xl border border-emerald-500/20" role="status">{message}</div>}
          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">Email</label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className="h-11" placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">Password</label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" className="h-11" placeholder="••••••••" aria-describedby="password-hint" />
              <p id="password-hint" className="text-xs text-muted-foreground">At least 6 characters.</p>
            </div>
            <Button type="submit" size="lg" className="w-full font-semibold" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}{!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">Already have an account?{' '}<Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link></p>
        </div>
      </div>
    </div>
  )
}
