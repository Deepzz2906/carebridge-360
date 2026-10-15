import React from 'react'
import {
  LayoutDashboard,
  Sparkles,
  Users,
  Clock,
  Pill,
  UserRound,
  Stethoscope,
  CalendarDays,
  ReceiptText,
  BarChart3,
  Database,
  History,
  Home
} from 'lucide-react'
import { UserRole } from '../../types'

export type NavTab =
  | 'landing'
  | 'dashboard'
  | 'recovery'
  | 'queue'
  | 'inventory'
  | 'patients'
  | 'doctors'
  | 'appointments'
  | 'billing'
  | 'analytics'
  | 'sql_demo'
  | 'audit'

interface SidebarProps {
  activeTab: NavTab
  onSelectTab: (tab: NavTab) => void
  currentRole: UserRole
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  currentRole,
}) => {
  const navSections = [
    {
      title: 'PUBLIC PORTAL',
      items: [
        { id: 'landing' as NavTab, label: 'Landing Page', icon: Home, roles: ['admin', 'doctor', 'receptionist', 'inventory_manager'] },
      ],
    },
    {
      title: 'CORE PLATFORM',
      items: [
        { id: 'dashboard' as NavTab, label: 'Operations Overview', icon: LayoutDashboard, roles: ['admin', 'doctor', 'receptionist', 'inventory_manager'] },
        { id: 'appointments' as NavTab, label: 'Appointments & Calendar', icon: CalendarDays, roles: ['admin', 'doctor', 'receptionist'] },
        { id: 'patients' as NavTab, label: 'Patient Directory', icon: Users, roles: ['admin', 'receptionist', 'doctor'] },
        { id: 'doctors' as NavTab, label: 'Doctor Management', icon: Stethoscope, roles: ['admin', 'receptionist', 'doctor'] },
      ],
    },
    {
      title: 'ACADEMIC NOVELTIES',
      items: [
        {
          id: 'recovery' as NavTab,
          label: 'Smart Slot Recovery',
          icon: Sparkles,
          badge: 'Primary Novelty',
          badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
          roles: ['admin', 'receptionist'],
        },
        {
          id: 'queue' as NavTab,
          label: 'Live Queue Estimation',
          icon: Clock,
          badge: 'Dynamic Wait',
          badgeColor: 'bg-teal-100 text-teal-700 border-teal-200',
          roles: ['admin', 'doctor', 'receptionist'],
        },
        {
          id: 'inventory' as NavTab,
          label: 'FEFO Medicine Intelligence',
          icon: Pill,
          badge: 'Expiry Alert',
          badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
          roles: ['admin', 'inventory_manager', 'doctor'],
        },
      ],
    },
    {
      title: 'OPERATIONS & REVENUE',
      items: [
        { id: 'billing' as NavTab, label: 'Billing & Invoices', icon: ReceiptText, roles: ['admin', 'receptionist'] },
        { id: 'analytics' as NavTab, label: 'Simulation & Analytics', icon: BarChart3, badge: 'FCFS vs Proposed', badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200', roles: ['admin', 'doctor', 'receptionist', 'inventory_manager'] },
      ],
    },
    {
      title: 'DATABASE & COMPLIANCE',
      items: [
        { id: 'sql_demo' as NavTab, label: 'BCSE302L SQL & Tests', icon: Database, badge: '10 Queries', badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200', roles: ['admin', 'doctor', 'receptionist', 'inventory_manager'] },
        { id: 'audit' as NavTab, label: 'System Audit Ledger', icon: History, roles: ['admin'] },
      ],
    },
  ]

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 min-h-[calc(100vh-61px)] select-none">
      <div className="py-4 px-3 space-y-6">
        {navSections.map((sec, sIdx) => {
          // Filter items based on user role
          const visibleItems = sec.items.filter((item) =>
            item.roles.includes(currentRole)
          )
          if (visibleItems.length === 0) return null

          return (
            <div key={sIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                {sec.title}
              </div>
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id

                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && !isActive && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer Info Box */}
      <div className="p-3 m-3 rounded-2xl bg-slate-50 border border-slate-200 text-left">
        <div className="flex items-center space-x-2 text-slate-700 font-bold text-xs">
          <UserRound className="w-3.5 h-3.5 text-blue-600" />
          <span>Active Role Access</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          Permissions enforced via PostgreSQL Row Level Security.
        </p>
      </div>
    </aside>
  )
}
