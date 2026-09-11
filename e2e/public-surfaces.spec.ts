import { test, expect } from '@playwright/test'

// Deterministic public-surface coverage that does not depend on a live
// backend: password-recovery entry point and the global not-found page.
// (Authenticated journeys require real Supabase credentials, which the E2E
// harness intentionally does not provide.)

test.describe('password recovery entry point is reachable', () => {
  test('reset-password page renders its form and recovery navigation', async ({
    page,
  }) => {
    await page.goto('/reset-password')

    await expect(
      page.getByRole('heading', { name: 'Reset your password' }),
    ).toBeVisible()
    await expect(page.locator('input#email')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Send Reset Link' })).toBeVisible()

    // Escape hatches back into the auth flow.
    await expect(
      page.getByRole('link', { name: /Back to sign in/ }),
    ).toHaveAttribute('href', '/login')
    await expect(
      page.getByRole('link', { name: 'Create account' }),
    ).toHaveAttribute('href', '/signup')
  })
})

test.describe('not-found page', () => {
  test('unknown route renders a styled 404 with recovery actions', async ({
    page,
  }) => {
    const response = await page.goto('/this-route-does-not-exist')
    expect(response).not.toBeNull()
    if (response) {
      expect(response.status()).toBeGreaterThanOrEqual(400)
    }

    await expect(
      page.getByRole('heading', { name: 'Page not found' }),
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Back to Basecamp' }),
    ).toHaveAttribute('href', '/')
    await expect(
      page.getByRole('link', { name: 'View Trips' }),
    ).toHaveAttribute('href', '/trips')
  })
})