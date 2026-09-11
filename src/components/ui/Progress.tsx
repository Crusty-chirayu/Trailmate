import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Progress = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { value?: number; label?: string }>(
  ({ className, value = 0, label, ...props }, ref) => (
    <div
      ref={ref}
      role="progressbar"
      aria-valuenow={Math.min(100, Math.max(0, value || 0))}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn('relative h-4 w-full overflow-hidden rounded-full bg-secondary', className)}
      {...props}
    >
      <div
        className="h-full bg-primary transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value || 0))}%` }}
      />
    </div>
  )
)
Progress.displayName = 'Progress'

export { Progress }
