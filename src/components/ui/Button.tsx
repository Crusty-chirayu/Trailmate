import { ButtonHTMLAttributes, forwardRef } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  href?: string
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', href, children, ...props }, ref) => {
    const buttonClasses = cn(
      'btn-premium ring-offset-background active:translate-y-px',
      {
        'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_8px_24px_rgba(93,145,91,0.2)]': variant === 'default',
        'bg-destructive text-destructive-foreground hover:bg-destructive/90': variant === 'destructive',
        'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground': variant === 'outline',
        'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
        'hover:bg-white/5 hover:text-foreground': variant === 'ghost',
        'text-primary-text underline-offset-4 hover:underline': variant === 'link',
      },
      {
        'h-10 py-2 px-4': size === 'default',
        'h-9 px-3 rounded-md': size === 'sm',
        'h-11 px-8 rounded-md': size === 'lg',
        'h-10 w-10': size === 'icon',
      },
      className
    )

    if (href) {
      return (
        <Link href={href} className={buttonClasses}>
          {children}
        </Link>
      )
    }

    return (
      <button
        className={buttonClasses}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button }
