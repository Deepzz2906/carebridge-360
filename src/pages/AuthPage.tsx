import React, { useState } from 'react'
import {
  Activity,
  Lock,
  Mail,
  User,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Stethoscope,
  KeyRound,
  Info
} from 'lucide-react'
import { UserRole } from '../types'
import { db } from '../services/db'

interface AuthPageProps {
  onSuccess: (role: UserRole) => void
  onCancel: () => void
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess, onCancel }) => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin')
  const [email, setEmail] = useState('admin@carebridge360.local')
  const [password, setPassword] = useState('••••••••••••')
  const [fullName, setFullName] = useState('Dr. Rajesh Ramanathan')
  const [staffLicense, setStaffLicense] = useState('MED-REG-94821')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const quickRoles: { role: UserRole; title: string; email: string; name: string }[] = [
    { role: 'admin', title: 'Administrator', email: 'admin@carebridge360.local', name: 'Dr. Rajesh Ramanathan' },
    { role: 'doctor', title: 'Doctor (Cardiology)', email: 'doctor@carebridge360.local', name: 'Dr. Priya Sundaram' },
    { role: 'receptionist', title: 'OPD Receptionist', email: 'receptionist@carebridge360.local', name: 'Ananya Krishnan' },
    { role: 'inventory_manager', title: 'Chief Pharmacist', email: 'pharmacy@carebridge360.local', name: 'Karthik Narayanan' },
  ]

  const handleSelectQuickRole = (r: typeof quickRoles[0]) => {
    setSelectedRole(r.role)
    setEmail(r.email)
    setFullName(r.name)
    setErrorMsg(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg(null)

    setTimeout(() => {
      setIsLoading(false)
      db.setCurrentRole(selectedRole)
      onSuccess(selectedRole)
    }, 400)
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white mx-auto shadow-md shadow-blue-500/20">
            <Activity className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {isSignUp ? 'Register Staff Account' : 'Staff Portal Login'}
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Secure Role-Based Access Control for CareBridge 360 Hospital Staff.
          </p>
        </div>

        {/* Phase 1 Prototype Notice */}
        <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-3 text-xs text-blue-900 flex items-start space-x-2.5">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Phase 1 Preview Mode:</span> Click any pre-configured role below to test role-specific dashboards with realistic synthetic permissions.
          </div>
        </div>

        {/* Quick-Fill Role Selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Select Test Profile (Quick Fill)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {quickRoles.map((r) => (
              <button
                key={r.role}
                type="button"
                onClick={() => handleSelectQuickRole(r)}
                className={`p-2.5 rounded-xl border text-left transition-all text-xs cursor-pointer ${
                  selectedRole === r.role
                    ? 'border-blue-600 bg-blue-50/70 font-bold text-blue-900 ring-1 ring-blue-500'
                    : 'border-slate-200 hover:border-blue-300 bg-white text-slate-700'
                }`}
              >
                <div className="font-bold">{r.title}</div>
                <div className="text-[10px] text-slate-400 font-mono truncate">{r.email}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {isSignUp && (
            <div>
              <label className="font-bold text-slate-700 block mb-1">Full Legal Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
            </div>
          )}

          <div>
            <label className="font-bold text-slate-700 block mb-1">Staff Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl font-mono"
              />
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="font-bold text-slate-700 block mb-1">Medical Council / Staff ID</label>
              <input
                type="text"
                required
                value={staffLicense}
                onChange={(e) => setStaffLicense(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-xl font-mono"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? 'Create Staff Profile' : 'Authenticate & Enter'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Mode Toggle & Cancel */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-bold text-blue-600 hover:underline cursor-pointer"
          >
            {isSignUp ? 'Already registered? Sign in' : 'New hospital staff? Register'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            Back to Portal
          </button>
        </div>
      </div>
    </div>
  )
}
