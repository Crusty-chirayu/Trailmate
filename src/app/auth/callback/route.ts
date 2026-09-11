import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

/**
 * PKCE auth callback. Handles three link kinds:
 * - Email confirmation / magic link: exchange code, continue to origin.
 * - Password recovery (`type=recovery`): exchange code, route to
 *   /update-password so the user can actually set the new password.
 * - Auth errors from Supabase links (`error` + `error_description`): surface
 *   them on /login rather than silently landing on the home page.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type')
  const authError = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  if (authError) {
    // Supabase auth links carry failures as query params, not HTTP errors.
    // Land on /login with the reason visible instead of failing silently.
    const loginUrl = new URL('/login', requestUrl.origin)
    loginUrl.searchParams.set('authError', errorDescription ?? authError)
    return NextResponse.redirect(loginUrl)
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      const loginUrl = new URL('/login', requestUrl.origin)
      loginUrl.searchParams.set('authError', error.message)
      return NextResponse.redirect(loginUrl)
    }

    if (type === 'recovery') {
      return NextResponse.redirect(new URL('/update-password', requestUrl.origin))
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin)
}
