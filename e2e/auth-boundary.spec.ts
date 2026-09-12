import { test, expect } from '@playwright/test'

// The core unauthenticated contract of TrailMate:
//  - Public pages (landing, marketing hero and auth forms) must render and stay
//    reachable without a session.
//  - Every protected route must fail closed and redirect to /login when the
//    request is not authenticated (no Supabase session).

test.describe('public auth pages', () => {
  test('login page renders the authentication form', async ({ page }) => {
    await page.goto('/login')

    await expect(
      page.getByRole('heading', { name: 'Welcome back' }),
    ).toBeVisible()
    await expect(page.locator('input#email')).toBeVisible()
    await expect(page.locator('input#password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
    // Primary auth-flow navigation still works without JavaScript.
    await expect(
      page.getByRole('link', { name: 'Create one' }),
    ).toHaveAttribute('href', '/signup')
  })

  test('signup page renders the registration form', async ({ page }) => {
    await page.goto('/signup')

    await expect(
      page.getByRole('heading', { name: 'Create your account' }),
    ).toBeVisible()
    await expect(page.locator('input#email')).toBeVisible()
    await expect(page.locator('input#password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Sign in' }),
    ).toHaveAttribute('href', '/login')
  })

  test('auth inputs expose accessible labels', async ({ page }) => {
    await page.goto('/login')

    for (const [id, label] of [
      ['email', 'Email'],
      ['password', 'Password'],
    ] as const) {
      await expect(page.locator(`input#${id}`)).toHaveAttribute('id', id)
      await expect(page.locator(`label[for="${id}"]`)).toHaveText(label)
    }
  })
})

test.describe('protected routes fail closed', () => {
  const protectedRoutes = [
    '/dashboard',
    '/trips',
    '/trips/new',
    '/trips/example-trip-id',
    '/trips/example-trip-id/track',
    '/trips/example-trip-id/route',
    '/trips/example-trip-id/pack',
    '/gear',
    '/gear/example-template-id',
    '/share/example-share-token',
  ] as const

  for (const route of protectedRoutes) {
    test(`${route} redirects to /login when unauthenticated`, async ({
      page,
    }) => {
      await page.goto(route)

      await expect(page).toHaveURL(/\/login$/)
      await expect(
        page.getByRole('heading', { name: 'Welcome back' }),
      ).toBeVisible()
    })
  }
})

test.describe('landing page is public to anonymous visitors', () => {
  test('hero and marketing content render without a session', async ({
    page,
  }) => {
    await page.goto('/')

    await expect(
      page.getByRole('heading', { level: 1, name: 'Plan the journey.' }),
    ).toBeVisible()
    // Primary conversion CTA targets signup.
    await expect(
      page.getByRole('link', { name: 'Start Exploring' }).first(),
    ).toHaveAttribute('href', '/signup')
    // Anonymous navigation exposes sign-in, never the authenticated dashboard.
    await expect(page.getByRole('link', { name: 'Sign in' }).first()).toHaveAttribute('href', '/login')
    await expect(page.getByRole('link', { name: 'Dashboard' })).toHaveCount(0)
  })

  test('provides a skip-to-content link for keyboard users', async ({ page }) => {
    await page.goto('/')
    const skip = page.getByRole('link', { name: 'Skip to content' }).first()
    await expect(skip).toBeVisible()
    await expect(skip).toHaveAttribute('href', '#main-content')
  })
})
