import React from 'react'
import { cn } from '../../lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rectangular' | 'circular'
  width?: string | number
  height?: string | number
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  style,
  ...props
}) => {
  const variants = {
    text: 'h-3 w-full rounded',
    rectangular: 'rounded-xl',
    circular: 'rounded-full',
  }

  return (
    <div
      className={cn(
        'bg-slate-200/70 animate-pulse',
        variants[variant],
        className
      )}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  )
}
