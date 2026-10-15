import React, { useState } from 'react'
import {
  Activity,
  ShieldCheck,
  RotateCcw,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Bell,
  LogIn,
  Menu,
  Database
} from 'lucide-react'
import { db } from '../../services/db'
import { UserRole } from '../../types'

interface NavbarProps {
  currentRole: UserRole
  onRoleChange: (role: UserRole) => void
  onResetDatabase: () => void
  onOpenNotifications: () => void
  onOpenAuth: () => void
  onToggleMobileMenu?: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  onResetDatabase,
  onOpenNotifications,
  onOpenAuth,
  onToggleMobileMenu,
}) => {
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  const handleConfirmReset = () => {
    onResetDatabase()
    setShowResetModal(false)
    setResetSuccess(true)
    setTimeout(() => setResetSuccess(false), 3000)
  }

  const roleNames: Record<UserRole, { label: string; badge: string; color: string }> = {
    admin: { label: 'Hospital Administrator', badge: 'Admin', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    doctor: { label: 'Consultant Cardiologist', badge: 'Doctor', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    receptionist: { label: 'OPD Reception Staff', badge: 'Reception', color: 'bg-teal-100 text-teal-800 border-teal-200' },
    inventory_manager: { label: 'Chief Pharmacist', badge: 'Pharmacy', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-2.5 transition-all">
      <div className="flex items-center justify-between">
        {/* Left: Mobile Menu Toggle + Branding */}
        <div className="flex items-center space-x-3">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 lg:hidden cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900">
                Care<span className="text-blue-600">Bridge</span>
              </span>
              <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                360°
              </span>
              <span className="hidden xl:inline text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                Phase 1 Frontend Preview
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-500 hidden sm:block">
              Hospital Appointment & Resource Optimization • BCSE302L
            </p>
          </div>
        </div>

        {/* Right Controls: Notifications, Role Switcher, Reset Demo, Auth */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {/* Notification Bell with alert pulse */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors border border-slate-200 cursor-pointer"
            title="Operational Alerts & Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {/* Role Switcher */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <select
              aria-label="Active User Role"
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-white text-xs font-bold text-slate-800 rounded-lg px-2.5 py-1.5 border border-slate-200 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="admin">Admin (All Access)</option>
              <option value="doctor">Doctor (Queue & OPD)</option>
              <option value="receptionist">Receptionist (Book & Recover)</option>
              <option value="inventory_manager">Pharmacist (FEFO)</option>
            </select>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${roleNames[currentRole].color} hidden sm:inline`}>
              {roleNames[currentRole].badge}
            </span>
          </div>

          {/* Reset Demo Button */}
          <button
            onClick={() => setShowResetModal(true)}
            className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-colors shadow-xs cursor-pointer"
            title="Reset synthetic database to initial seed"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>

          {/* Auth Button */}
          <button
            onClick={onOpenAuth}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors shadow-xs cursor-pointer"
            title="Sign In with different staff profile"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Staff Login</span>
          </button>
        </div>
      </div>

      {/* Toast Confirmation of Reset */}
      {resetSuccess && (
        <div className="absolute top-16 right-6 flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg animate-bounce text-xs font-semibold z-50">
          <CheckCircle2 className="w-4 h-4" />
          <span>Synthetic dataset reset to clean initial seed (100 patients, 200 appointments).</span>
        </div>
      )}

      {/* Safe Demo Reset Confirmation Dialog */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-amber-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Reset Synthetic Demo Data?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              This will restore all 13 PostgreSQL tables to the reproducible academic seed:
              <strong className="text-slate-800"> 100 patients, 10 doctors, 200 appointments, 50 waitlists, and 100 medicine batches</strong>.
              All runtime cancellations, recoveries, and stock dispatches will be refreshed.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
