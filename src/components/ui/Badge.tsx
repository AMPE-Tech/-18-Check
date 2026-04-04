import { cn, riskColor, riskLabel } from '../../lib/utils'

interface BadgeProps {
  level: string
  className?: string
}

export default function Badge({ level, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        riskColor(level),
        className
      )}
    >
      {riskLabel(level)}
    </span>
  )
}
