#!/usr/bin/env node
//
// Live Supabase deployment verification.
//
// Verifies that a TrailMate deployment can reach the real Supabase project
// using the same public browser configuration the app uses:
//   1. /auth/v1/health          -> project is up and reachable
//   2. password grant, wrong credentials -> 400 invalid credentials
//      (proves the auth gateway accepts the anon key end-to-end without
//       creating any user or data)
//   3. /rest/v1/ (OpenAPI root) -> PostgREST gateway accepts the key
//
// The script never prints credential values or the project URL — only status
// codes. Credentials are read from the environment:
//   NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
// Run `npm run verify:live` wherever outbound network access exists (locally,
// or in CI once the repository secrets are configured).

import { runLiveProbes, formatLiveProbeReport } from './security/live-probes.mjs'

function readEnv(name) {
  const value = process.env[name]
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null
}

const baseUrl = readEnv('NEXT_PUBLIC_SUPABASE_URL')
const anonKey = readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

if (!baseUrl || !anonKey) {
  console.error(
    'Live verification requires NEXT_PUBLIC_SUPABASE_URL and ' +
      'NEXT_PUBLIC_SUPABASE_ANON_KEY in the environment. Set them in .env.local ' +
      '(local) or as repository secrets (CI). No values were printed.',
  )
  process.exit(1)
}

if (!/^https:\/\/[a-z0-9-]+\.supabase\.(co|in)\/?$/.test(baseUrl)) {
  console.error(
    'NEXT_PUBLIC_SUPABASE_URL does not look like a Supabase project URL ' +
      '(expected https://<project-ref>.supabase.co). No values were printed.',
  )
  process.exit(1)
}

try {
  const results = await runLiveProbes({ baseUrl, anonKey, fetchImpl: fetch })
  console.log(formatLiveProbeReport(results))
  process.exit(results.every(r => r.ok) ? 0 : 1)
} catch (error) {
  console.error(
    'Live verification could not reach the network. Run this command from a ' +
      'machine or CI runner with outbound HTTPS access:',
    error instanceof Error ? error.message : String(error),
  )
  process.exit(1)
}
