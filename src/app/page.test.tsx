/**
 * Server-render smoke tests for the home page.
 */
import { describe, it, expect, vi } from 'vitest'

const mockGetUser = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: () => mockGetUser() },
  }),
}))

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`)
  },
}))

describe('home page', () => {
  it('redirects authenticated users to dashboard', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'qa@example.com' } } })

    const { default: Home } = await import('./page')
    await expect(Home()).rejects.toThrow('REDIRECT:/dashboard')
  })

  it('renders landing page for unauthenticated users', async () => {
    mockGetUser.mockReset()
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const { default: Home } = await import('./page')
    // Should not redirect, should render LandingPage
    await expect(Home()).resolves.not.toThrow()
  })
})
