import React from 'react'
import {
  Bell,
  Sparkles,
  AlertTriangle,
  Pill,
  Clock,
  X,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'
import { NavTab } from './Sidebar'

export interface NotificationItem {
  id: string
  title: string
  description: string
  timestamp: string
  type: 'recovery' | 'expiry' | 'queue' | 'billing'
  targetTab: NavTab
  read: boolean
}

interface NotificationDrawerProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: (tab: NavTab) => void
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  if (!isOpen) return null

  const notifications: NotificationItem[] = [
    {
      id: 'notif-1',
      title: 'Slot Recovery Opportunity',
      description: 'Cardiology slot (11:30 AM) was cancelled by patient. 4 eligible waitlist candidates identified.',
      timestamp: '5 mins ago',
      type: 'recovery',
      targetTab: 'recovery',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Critical Medicine Expiry Alert',
      description: 'Batch BN-2026-21-450 (Paracetamol 650mg) expires in 5 days. Prioritize FEFO dispensing.',
      timestamp: '22 mins ago',
      type: 'expiry',
      targetTab: 'inventory',
      read: false,
    },
    {
      id: 'notif-3',
      title: 'OPD Patient Checked In',
      description: 'Patient Aarav Sharma (Token #3) has arrived and checked into waiting room.',
      timestamp: '40 mins ago',
      type: 'queue',
      targetTab: 'queue',
      read: true,
    },
    {
      id: 'notif-4',
      title: 'Pending Invoice Settlement',
      description: 'Invoice INV-20261015-004 for Dr. Priya Sundaram is awaiting payment clearance.',
      timestamp: '1 hour ago',
      type: 'billing',
      targetTab: 'billing',
      read: true,
    },
  ]

  const typeIcons = {
    recovery: <Sparkles className="w-4 h-4 text-blue-600" />,
    expiry: <Pill className="w-4 h-4 text-amber-600" />,
    queue: <Clock className="w-4 h-4 text-teal-600" />,
    billing: <AlertTriangle className="w-4 h-4 text-purple-600" />,
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-200">
        <div>
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-900">Hospital Operational Alerts</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List of alerts */}
          <div className="p-3 space-y-2.5 overflow-y-auto max-h-[calc(100vh-120px)]">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  onNavigate(n.targetTab)
                  onClose()
                }}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  !n.read
                    ? 'bg-blue-50/50 border-blue-200 hover:bg-blue-50'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                      {typeIcons[n.type]}
                    </div>
                    <span className="font-bold text-xs text-slate-900">{n.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.timestamp}</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-2 leading-relaxed pl-8">
                  {n.description}
                </p>
                <div className="flex items-center justify-end text-[10px] font-bold text-blue-600 mt-2">
                  <span>View Details</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 text-[11px] text-slate-400 text-center bg-slate-50">
          Generated in real-time from active relational database events.
        </div>
      </div>
    </div>
  )
}
