import { describe, it, expect, vi } from 'vitest'
import { runLiveProbes, formatLiveProbeReport } from './live-probes.mjs'

const BASE = 'https://example-project.supabase.co/'
const KEY = 'anon-key'

function fakeFetch(responses) {
  return vi.fn(async url => {
    const key = Object.keys(responses).find(prefix => url.startsWith(prefix))
    if (!key) throw new Error(`unexpected fetch: ${url}`)
    return responses[key]
  })
}

describe('live Supabase probes', () => {
  it('passes when all three probes return expected statuses', async () => {
    const fetchImpl = fakeFetch({
      'https://example-project.supabase.co/auth/v1/health': { status: 200 },
      'https://example-project.supabase.co/auth/v1/token': { status: 400 },
      'https://example-project.supabase.co/rest/v1/': { status: 200 },
    })
    const results = await runLiveProbes({ baseUrl: BASE, anonKey: KEY, fetchImpl })
    expect(results.map(r => r.ok)).toEqual([true, true, true])
    // Auth probe must be a POST (credential grant), rest/health are reads.
    expect(fetchImpl.mock.calls[1][1].method).toBe('POST')
    const body = JSON.parse(fetchImpl.mock.calls[1][1].body)
    expect(body.email.endsWith('.invalid')).toBe(true)
  })

  it('fails the invalid-credentials probe when the gateway leaks a success', async () => {
    const fetchImpl = fakeFetch({
      'https://example-project.supabase.co/auth/v1/health': { status: 200 },
      'https://example-project.supabase.co/auth/v1/token': { status: 200 },
      'https://example-project.supabase.co/rest/v1/': { status: 200 },
    })
    const results = await runLiveProbes({ baseUrl: BASE, anonKey: KEY, fetchImpl })
    expect(results[1].ok).toBe(false)
    expect(results[1].expect).toBe(400)
  })

  it('treats a paused project (503) as failure and reports status codes only', async () => {
    const fetchImpl = fakeFetch({
      'https://example-project.supabase.co/auth/v1/health': { status: 503 },
      'https://example-project.supabase.co/auth/v1/token': { status: 503 },
      'https://example-project.supabase.co/rest/v1/': { status: 503 },
    })
    const results = await runLiveProbes({ baseUrl: BASE, anonKey: KEY, fetchImpl })
    expect(results.every(r => !r.ok)).toBe(true)
    const report = formatLiveProbeReport(results)
    expect(report).toContain('503')
    expect(report).not.toContain(KEY)
    expect(report).not.toContain(BASE)
  })

  it('normalizes a trailing-slash base URL', async () => {
    const fetchImpl = vi.fn(async url => ({ status: url.includes('auth/v1/health') ? 200 : 400 }))
    await runLiveProbes({ baseUrl: BASE, anonKey: KEY, fetchImpl })
    const urls = fetchImpl.mock.calls.map(c => c[0])
    expect(urls.every(u => !u.includes('//auth'))).toBe(true)
    expect(urls[0]).toBe('https://example-project.supabase.co/auth/v1/health')
  })

  it('rejects missing dependencies instead of calling fetch', async () => {
    await expect(runLiveProbes({ baseUrl: BASE, fetchImpl: vi.fn() })).rejects.toThrow('anonKey')
    await expect(runLiveProbes({ anonKey: KEY, fetchImpl: vi.fn() })).rejects.toThrow('baseUrl')
    await expect(runLiveProbes({ baseUrl: BASE, anonKey: KEY })).rejects.toThrow('fetchImpl')
  })
})
