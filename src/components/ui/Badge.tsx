import React from 'react'
import { cn } from '../../lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'blue' | 'teal' | 'emerald' | 'amber' | 'rose' | 'slate' | 'purple'
  size?: 'sm' | 'md'
  dot?: boolean
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'blue',
  size = 'md',
  dot = false,
  ...props
}) => {
  const variants = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    teal: 'bg-teal-50 text-teal-700 border-teal-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  }

  const dotColors = {
    blue: 'bg-blue-500',
    teal: 'bg-teal-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    slate: 'bg-slate-400',
    purple: 'bg-purple-500',
  }

  const sizes = {
    sm: 'text-[9px] px-1.5 py-0.2',
    md: 'text-[10px] px-2 py-0.5',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-bold rounded-md border',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  )
}
