import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Screen Wake Lock integration for active GPS recording.
 *
 * The browser Geolocation API is foreground-only: when the OS locks the screen
 * or the user switches tabs, the browser suspends GPS. The Screen Wake Lock API
 * prevents the former (the screen going to sleep mid-recording) on supported
 * browsers (Chromium on Android, Windows, macOS, Linux). It does NOT — and
 * cannot — keep GPS running once the tab is fully backgrounded or closed.
 *
 * Graceful degradation:
 *  - unsupported browsers: recording works, just no wake lock
 *  - lock lost (screen locked by user/OS): we release cleanly and the tracking
 *    hook's visibility listener auto-pauses the session
 *  - lock re-request is attempted whenever the page returns to foreground
 */

interface WakeLockResult {
  supported: boolean
  active: boolean
  request: () => Promise<void>
  release: () => Promise<void>
}

export function useScreenWakeLock(enabled: boolean): WakeLockResult {
  const supported = typeof navigator !== 'undefined' && 'wakeLock' in navigator
  const [active, setActive] = useState(false)
  const releaseRef = useRef<(() => void) | null>(null)

  const release = useCallback(async () => {
    const releaseLock = releaseRef.current
    releaseRef.current = null
    if (!releaseLock) return
    try {
      await releaseLock()
    } catch {
      // Ignore release errors — the lock may already be gone.
    } finally {
      setActive(false)
    }
  }, [])

  const request = useCallback(async () => {
    if (!supported) return
    if (releaseRef.current) return // already held
    try {
      const lock = await (navigator as unknown as {
        wakeLock: { request: (type: string) => Promise<{ release: () => Promise<void>; addEventListener: (event: string, cb: () => void) => void }> }
      }).wakeLock.request('screen')

      releaseRef.current = () => lock.release()
      setActive(true)

      const onRelease = () => {
        releaseRef.current = null
        setActive(false)
        // If the page is still supposed to be recording, try to re-acquire
        // on the next visibility change.
      }
      lock.addEventListener('release', onRelease)
    } catch {
      // Wake lock request failed (e.g., low battery, policy). Recording continues.
      setActive(false)
    }
  }, [supported])

  // Acquire/release wake lock based on recording state. Wrapped in an async IIFE so the
  // setState calls happen inside promise callbacks, not synchronously in the effect body.
  useEffect(() => {
    const ctl = new AbortController()
    void (async () => {
      if (ctl.signal.aborted) return
      if (enabled && supported && document.visibilityState === 'visible') {
        await request()
      } else {
        await release()
      }
    })()
    return () => { ctl.abort(); void release() }
  }, [enabled, supported, request, release])

  // Re-acquire on visibility change if still recording.
  useEffect(() => {
    if (!enabled || !supported) return
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') { void request() }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [enabled, supported, request])

  return { supported, active, request, release }
}
