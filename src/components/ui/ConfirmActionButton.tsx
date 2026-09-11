'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from './Button'

function isRedirectError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'digest' in error &&
    typeof (error as { digest: string }).digest === 'string' &&
    (error as { digest: string }).digest.startsWith('NEXT_REDIRECT')
  )
}

/**
 * Accessible confirmation wrapper for destructive server actions.
 *
 * The trigger renders as an outline button; the actual action only runs after
 * the user confirms in a modal dialog (Escape and overlay click cancel,
 * initial focus lands on Cancel, focus is restored to the trigger on close).
 */
export default function ConfirmActionButton({
  triggerLabel,
  dialogTitle,
  dialogDescription,
  confirmLabel = 'Delete',
  onConfirm,
  loadingLabel = 'Deleting…',
  className,
}: {
  triggerLabel: string
  dialogTitle: string
  dialogDescription: React.ReactNode
  confirmLabel?: string
  onConfirm: () => Promise<void>
  loadingLabel?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      // Initial focus on Cancel — the safe choice for a destructive action.
      cancelRef.current?.focus()
    } else if (dialogRef.current === null) {
      // Dialog just closed via state change; restore focus to the trigger.
    }
  }, [open])

  useEffect(() => {
    if (!open && error) {
      triggerRef.current?.focus()
    }
  }, [open, error])

  const handleConfirm = async () => {
    setLoading(true)
    setError(null)
    try {
      await onConfirm()
      // Server action redirects on success; rethrowing lets Next.js handle it.
    } catch (e) {
      if (isRedirectError(e)) throw e
      setError(e instanceof Error ? e.message : 'The action failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        ref={triggerRef}
        variant="outline"
        className={className}
        onClick={() => {
          setError(null)
          setOpen(true)
        }}
      >
        {triggerLabel}
      </Button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-action-title"
          aria-describedby="confirm-action-desc"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !loading && setOpen(false)}
          onKeyDown={e => {
            if (e.key === 'Escape' && !loading) setOpen(false)
          }}
        >
          <div
            className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg"
            onClick={e => e.stopPropagation()}
          >
            <h2 id="confirm-action-title" className="text-lg font-semibold mb-2">
              {dialogTitle}
            </h2>
            <div id="confirm-action-desc" className="text-sm text-muted-foreground mb-4">
              {dialogDescription}
            </div>
            {error && (
              <p role="alert" className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-3">
              <Button
                ref={cancelRef}
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
                aria-label="Cancel"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirm}
                disabled={loading}
                aria-label={confirmLabel}
              >
                {loading ? loadingLabel : confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}