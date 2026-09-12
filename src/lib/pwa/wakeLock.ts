/**
 * Screen Wake Lock core logic.
 *
 * The browser Geolocation API is foreground-only: when the OS locks the screen
 * or the user switches tabs, the browser suspends GPS. The Screen Wake Lock API
 * prevents the former (the screen going to sleep mid-recording) on supported
 * browsers (Chromium on Android, Windows, macOS, Linux). It does NOT — and
 * cannot — keep GPS running once the tab is fully backgrounded or closed.
 *
 * This module is framework-agnostic and fully unit-testable.
 */

export interface WakeLockNavigator {
  wakeLock: {
    request: (type: 'screen') => Promise<WakeLockSentinel>
  }
}

export interface WakeLockSentinel {
  release: () => Promise<void>
  addEventListener: (event: string, cb: () => void) => void
}

export function isWakeLockSupported(navigator: unknown): boolean {
  return (
    typeof navigator === 'object' &&
    navigator !== null &&
    'wakeLock' in (navigator as Record<string, unknown>)
  )
}

export async function requestWakeLock(
  navigator: WakeLockNavigator,
  onRelease: () => void,
): Promise<(() => void) | null> {
  try {
    const lock = await navigator.wakeLock.request('screen')
    lock.addEventListener('release', onRelease)
    return async () => {
      try {
        await lock.release()
      } catch {
        // Lock may already be released.
      }
    }
  } catch {
    return null
  }
}
