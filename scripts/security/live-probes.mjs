// Pure probe logic for live Supabase verification, factored out so the
// behavior can be unit-tested with an injected fetch implementation.
//
// Design constraints:
// - only public anon/browser credentials are used
// - no probe creates users or rows: the auth check deliberately sends wrong
//   credentials and expects the invalid-credentials rejection
// - results carry status codes only, never credential or URL values

export const EXPECTED_PROBES = [
  { id: 'auth-health', expect: 200 },
  { id: 'auth-invalid-credentials', expect: 400 },
  { id: 'rest-gateway', expect: 200 },
]

function normalizeBaseUrl(baseUrl) {
  return baseUrl.replace(/\/+$/, '')
}

function statusCode(response) {
  return typeof response?.status === 'number' ? response.status : null
}

/**
 * Executes the three live probes. `fetchImpl` is injectable for tests.
 * Throws on network-level failure (DNS, unreachable host) so the CLI can
 * distinguish "service misconfigured" from "no network here".
 */
export async function runLiveProbes({ baseUrl, anonKey, fetchImpl }) {
  if (typeof fetchImpl !== 'function') throw new TypeError('fetchImpl is required')
  if (typeof baseUrl !== 'string' || baseUrl === '') throw new TypeError('baseUrl is required')
  if (typeof anonKey !== 'string' || anonKey === '') throw new TypeError('anonKey is required')

  const base = normalizeBaseUrl(baseUrl)
  const authHeaders = { apikey: anonKey, 'Content-Type': 'application/json' }

  const health = await fetchImpl(`${base}/auth/v1/health`, { headers: { apikey: anonKey } })
  const healthStatus = statusCode(health)

  // Wrong password on purpose: proves the full auth gateway path (key check,
  // endpoint routing, credential verification) while creating no data.
  const invalidLogin = await fetchImpl(`${base}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ email: 'trailmate-live-probe@example.invalid', password: 'probe-wrong-password' }),
  })
  const invalidLoginStatus = statusCode(invalidLogin)

  const rest = await fetchImpl(`${base}/rest/v1/`, { headers: { apikey: anonKey } })
  const restStatus = statusCode(rest)

  return [
    { id: 'auth-health', expect: 200, status: healthStatus, ok: healthStatus === 200 },
    {
      id: 'auth-invalid-credentials',
      expect: 400,
      status: invalidLoginStatus,
      ok: invalidLoginStatus === 400,
    },
    { id: 'rest-gateway', expect: 200, status: restStatus, ok: restStatus === 200 },
  ]
}

/** Human-readable report. Contains no credential or URL values. */
export function formatLiveProbeReport(results) {
  const lines = results.map(
    r =>
      `${r.ok ? 'PASS' : 'FAIL'}  ${r.id}: status ${r.status ?? 'no response'} (expected ${r.expect})`,
  )
  const passed = results.filter(r => r.ok).length
  lines.push(`${passed}/${results.length} live probes passed.`)
  if (passed !== results.length) {
    lines.push(
      'A failing probe usually means the project URL or anon key is wrong, the project is paused, or the gateway is unreachable.',
    )
  }
  return lines.join('\n')
}
