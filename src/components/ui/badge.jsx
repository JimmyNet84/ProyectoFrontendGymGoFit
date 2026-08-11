import * as React from 'react'
import { cn } from '../../lib/utils'

const badgeVariants = {
  default: 'bg-blue-100 text-blue-700',
  success: 'bg-emerald-100 text-emerald-700',
  danger: 'bg-red-100 text-red-700',
  warning: 'bg-amber-100 text-amber-700',
  outline: 'border border-slate-200 bg-white text-slate-700'
}

const Badge = ({ className, variant = 'default', ...props }) => {
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', badgeVariants[variant] || badgeVariants.default, className)} {...props} />
}

export { Badge }
