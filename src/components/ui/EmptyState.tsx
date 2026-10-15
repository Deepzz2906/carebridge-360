import React from 'react'
import { FolderSearch, LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FolderSearch,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div className={cn('p-12 text-center rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3', className)}>
      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 mx-auto shadow-xs">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h4 className="font-bold text-slate-800 text-sm">{title}</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
          {description}
        </p>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-3.5 py-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
