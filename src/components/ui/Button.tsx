import React from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  icon?: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 select-none active:scale-[0.98]'

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs focus:ring-blue-500 shadow-blue-500/20',
    secondary: 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs focus:ring-teal-500',
    outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 focus:ring-blue-500',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-400',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus:ring-rose-500',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs focus:ring-emerald-500',
  }

  const sizes = {
    sm: 'text-[11px] px-2.5 py-1.5 gap-1.5',
    md: 'text-xs px-3.5 py-2 gap-2',
    lg: 'text-sm px-5 py-2.5 gap-2.5',
  }

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        (disabled || isLoading) && 'opacity-60 cursor-not-allowed active:scale-100',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  )
}
