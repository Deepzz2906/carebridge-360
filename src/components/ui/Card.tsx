import React from 'react'
import { cn } from '../../lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
  glass?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverable = false,
  glass = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-200',
        glass && 'glass-card',
        hoverable && 'hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
