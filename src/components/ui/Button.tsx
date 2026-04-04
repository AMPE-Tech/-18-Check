import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'
import { Loader2 } from 'lucide-react'

const variants = {
  primary:
    'bg-gold text-black font-semibold hover:bg-gold-light active:bg-gold-dark shadow-lg shadow-gold/10',
  secondary:
    'bg-surface-light text-gray-200 border border-surface-border hover:bg-surface-border/50',
  outline:
    'border border-gold/40 text-gold hover:bg-gold/10 hover:border-gold/60',
  ghost:
    'text-gray-400 hover:text-gray-200 hover:bg-white/5',
  danger:
    'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20',
} as const

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-5 py-2.5 text-sm rounded-lg',
  lg: 'px-7 py-3 text-base rounded-lg',
} as const

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
