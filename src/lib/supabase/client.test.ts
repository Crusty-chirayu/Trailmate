import { describe, it, expect } from 'vitest'
import { mapAuthError, SUPABASE_CONFIG_ERROR } from './client'

describe('mapAuthError', () => {
  it('maps raw browser fetch failures to an honest connectivity message when configured', () => {
    const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://real-project.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'sb-test-anon-key'
    try {
      const message = mapAuthError('TypeError: Failed to fetch')
      expect(message).toBe('Could not reach the authentication service. Check your internet connection and try again.')
    } finally {
      process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey
    }
  })

  it('explains missing Supabase configuration instead of a raw network error', () => {
    const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://your-project-ref.supabase.co'
    try {
      expect(mapAuthError('TypeError: Failed to fetch')).toBe(SUPABASE_CONFIG_ERROR)
    } finally {
      process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
    }
  })

  it('passes through Supabase-reported errors untouched', () => {
    expect(mapAuthError('Invalid login credentials')).toBe('Invalid login credentials')
  })

  it('provides a fallback for undefined errors', () => {
    expect(mapAuthError(undefined)).toContain('unexpected error')
  })
})