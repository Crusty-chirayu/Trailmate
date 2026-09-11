import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

/**
 * True when the Supabase environment is actually usable. Placeholder values
 * from `.env.example` copied into `.env` produce a browser client pointed at a
 * nonexistent host, which surfaces as an opaque "Failed to fetch" — we detect
 * that configuration state instead so the UI can explain it honestly.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return false
  if (url.includes('your-project-ref') || key.startsWith('your-')) return false
  return /^https?:\/\/.+/.test(url)
}

export const SUPABASE_CONFIG_ERROR =
  'This app is not connected to its backend (Supabase). The deployment is missing real Supabase credentials — see the README "Supabase setup" section. Nothing was sent.'

/** Map raw auth/network failures to honest, actionable user messages. */
export function mapAuthError(raw: string | undefined): string {
  const message = (raw ?? '').toLowerCase()
  if (message.includes('failed to fetch') || message.includes('networkerror') || message.includes('load failed')) {
    return isSupabaseConfigured()
      ? 'Could not reach the authentication service. Check your internet connection and try again.'
      : SUPABASE_CONFIG_ERROR
  }
  return raw ?? 'An unexpected error occurred. Please try again.'
}

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
