import React from 'react'
import {
  CalendarDays,
  Sparkles,
  Clock,
  Pill,
  Users,
  ReceiptText,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
  Activity
} from 'lucide-react'
import { db } from '../services/db'
import { NavTab } from '../components/layout/Sidebar'
import { formatCurrency, formatTime, formatDate } from '../lib/utils'

import { MOCK_PREVIEW_KPIS, MOCK_DEPARTMENT_WORKLOAD, MOCK_DATA_DISCLAIMER } from '../mock/mockData'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'

interface DashboardOverviewProps {
  onNavigate: (tab: NavTab) => void
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate }) => {
  const patients = db.getPatients()
  const doctors = db.getDoctors()
  const appointments = db.getAppointments()
  const todayApts = appointments.filter((a) => a.appointment_date === '2026-10-15')
  const recoveries = db.getRecoverableSlots()
  const availableRecoveries = recoveries.filter((r) => r.status === 'available')
  const batches = db.getBatches()
  const urgentBatches = batches.filter((b) => b.expiry_status === 'urgent_7d' || b.expiry_status === 'expired')
  const bills = db.getBills()
  const paidRevenue = bills.filter((b) => b.payment_status === 'Paid').reduce((sum, b) => sum + b.total_amount, 0)
  const auditLogs = db.getAuditLogs().slice(0, 5)

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-4">
      {/* WELCOME BANNER */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-200 mb-2">
            <Activity className="w-3.5 h-3.5 text-teal-300" />
            <span>Hospital Operations Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            CareBridge 360 Operational Overview
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl mt-1 leading-relaxed">
            Coordinating outpatient appointments, explainable slot recoveries, doctor queues, and FEFO inventory across 10 hospital departments.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => onNavigate('recovery')}
            className="px-4 py-2.5 rounded-xl bg-white text-blue-900 font-bold text-xs shadow-md hover:bg-blue-50 transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{availableRecoveries.length} Slots to Recover</span>
          </button>
          <button
            onClick={() => onNavigate('queue')}
            className="px-4 py-2.5 rounded-xl bg-teal-500 text-white font-bold text-xs shadow-md hover:bg-teal-600 transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>Live Queue</span>
          </button>
        </div>
      </div>

      {/* PHASE 1 FRONTEND PREVIEW SEPARATION BANNER */}
      <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2.5 text-amber-900 font-semibold">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Phase 1 Frontend Foundation Preview:</strong> Using synthetic seed data only. Real PostgreSQL schemas, Supabase Auth, and RLS policies are prepared for Phase 2 integration.
          </span>
        </div>
        <span className="shrink-0 font-mono font-bold text-[10px] text-amber-700 bg-white px-2.5 py-1 rounded-lg border border-amber-200">
          Synthetic Seed v1.0
        </span>
      </div>

      {/* TOP STAT METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>TODAY'S CONSULTATIONS</span>
            <CalendarDays className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{todayApts.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {todayApts.filter((a) => a.status === 'Completed').length} Completed • {todayApts.filter((a) => a.status === 'In Progress').length} Active
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>SLOT RECOVERY QUEUE</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-600 mt-2">{availableRecoveries.length}</div>
          <div className="text-[11px] text-amber-700 font-semibold mt-0.5">
            Explainable matching active
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>AT-RISK DRUG BATCHES</span>
            <Pill className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-black text-rose-600 mt-2">{urgentBatches.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Expired or &le; 7 days left
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>COLLECTED REVENUE</span>
            <ReceiptText className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600 mt-2">
            {formatCurrency(paidRevenue)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Total consultation billing
          </div>
        </div>
      </div>

      {/* QUICK LAUNCH ACADEMIC NOVELTIES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* NOVELTY 1 CARD */}
        <div
          onClick={() => onNavigate('recovery')}
          className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 border border-blue-200">
              Primary Novelty
            </span>
          </div>
          <h3 className="font-extrabold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
            Smart Slot Recovery
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Multi-criteria explainable formula: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[10px]">70×Time + 30×Age</code>. Replaces cancelled slots with atomic transactional safety.
          </p>
          <div className="flex items-center text-xs font-bold text-blue-600 pt-2">
            <span>Open Matching Engine</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* NOVELTY 2 CARD */}
        <div
          onClick={() => onNavigate('queue')}
          className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-teal-400 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-700 border border-teal-200">
              Secondary Novelty
            </span>
          </div>
          <h3 className="font-extrabold text-slate-900 text-base group-hover:text-teal-600 transition-colors">
            Live Queue Estimation
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Live doctor token boards with running empirical consultation duration learning and dynamic patient wait times.
          </p>
          <div className="flex items-center text-xs font-bold text-teal-600 pt-2">
            <span>View Doctor Chambers</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* NOVELTY 3 CARD */}
        <div
          onClick={() => onNavigate('inventory')}
          className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-amber-400 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Pill className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 border border-amber-200">
              Third Novelty
            </span>
          </div>
          <h3 className="font-extrabold text-slate-900 text-base group-hover:text-amber-600 transition-colors">
            FEFO Medicine Intelligence
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            First-Expiry-First-Out dispensing protocols and non-negative stock database constraints across 100 medicine batches.
          </p>
          <div className="flex items-center text-xs font-bold text-amber-600 pt-2">
            <span>Manage Drug Stock</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* TWO COLUMN FEED: TODAY'S APPOINTMENTS & AUDIT LEDGER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* TODAY'S CONSULTATIONS */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Today's Clinic Activity (15 Oct 2026)</h2>
              <p className="text-[11px] text-slate-500">Live consultation tracking across OPD departments.</p>
            </div>
            <button
              onClick={() => onNavigate('appointments')}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              View All ({todayApts.length})
            </button>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto">
            {todayApts.slice(0, 6).map((apt) => (
              <div
                key={apt.appointment_id}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-blue-600 text-xs">
                    #{apt.token_number}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{apt.patient?.full_name}</div>
                    <div className="text-[11px] text-slate-500">
                      {apt.doctor?.full_name} ({apt.doctor?.specialty}) • {formatTime(apt.appointment_time)}
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    apt.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : apt.status === 'Cancelled'
                      ? 'bg-rose-100 text-rose-800 border-rose-200'
                      : apt.status === 'In Progress'
                      ? 'bg-teal-100 text-teal-800 border-teal-200'
                      : 'bg-blue-100 text-blue-800 border-blue-200'
                  }`}
                >
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SYSTEM AUDIT LOG LEDGER */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">PostgreSQL Audit Ledger</h2>
              <p className="text-[11px] text-slate-500">Immutable record of state mutations.</p>
            </div>
            <button
              onClick={() => onNavigate('audit')}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Full Ledger
            </button>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.log_id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-[11px]">{log.action_type}</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Table: <strong className="text-slate-700">{log.table_name}</strong> • Record: <span className="font-mono">{log.record_id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
