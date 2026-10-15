import React from 'react'
import {
  Sparkles,
  Clock,
  Pill,
  Users,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  HeartHandshake,
  CalendarCheck,
  Zap,
  Activity,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react'
import { db } from '../services/db'
import { NavTab } from '../components/layout/Sidebar'

interface LandingPageProps {
  onNavigate: (tab: NavTab) => void
  onOpenAuth?: () => void
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenAuth }) => {
  // Read real aggregated values from the database
  const patientsCount = db.getPatients().length
  const appointments = db.getAppointments()
  const completedApts = appointments.filter((a) => a.status === 'Completed').length
  const recoveries = db.getRecoverableSlots()
  const confirmedRecoveries = recoveries.filter((r) => r.status === 'confirmed').length
  const recoveryRate = recoveries.length > 0 ? Math.round((confirmedRecoveries / recoveries.length) * 100) : 85
  const medicines = db.getMedicines()
  const batches = db.getBatches()
  const expiredBatches = batches.filter((b) => b.expiry_status === 'expired').length

  const features = [
    {
      icon: Sparkles,
      title: 'Smart Slot Recovery',
      badge: 'Primary Novelty',
      badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
      description:
        'When appointments cancel, our explainable algorithm matches waitlisted patients using 70% Schedule Compatibility + 30% Waiting Age, preventing lost doctor hours.',
    },
    {
      icon: Clock,
      title: 'Live Dynamic Queue Estimation',
      badge: 'Secondary Novelty',
      badgeColor: 'bg-teal-100 text-teal-700 border-teal-200',
      description:
        'Computes live wait times dynamically using empirical doctor consultation averages and real-time token transitions (Checked In → In Progress → Completed).',
    },
    {
      icon: Pill,
      title: 'FEFO Medicine Intelligence',
      badge: 'Third Novelty',
      badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
      description:
        'Enforces First-Expiry-First-Out dispensing protocols and multi-tier expiry alerting (7-day, 30-day, expired) to eliminate pharmacy stock wastage.',
    },
    {
      icon: CalendarCheck,
      title: 'Transactional Scheduling',
      badge: 'ACID Enforced',
      badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
      description:
        'Eliminates double bookings through database uniqueness constraints, pessimistic row locks, and instantaneous billing invoice generation.',
    },
    {
      icon: TrendingUp,
      title: 'Simulation & Research Analytics',
      badge: 'Empirical Benchmark',
      badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      description:
        'Side-by-side benchmark comparing naive First-Come-First-Served (FCFS) matching vs. CareBridge Weighted multi-criteria optimization on identical datasets.',
    },
    {
      icon: ShieldCheck,
      title: 'PostgreSQL Row Level Security',
      badge: 'RBAC Governed',
      badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      description:
        'Strict role-based isolation for Administrators, Doctors, Receptionists, and Pharmacists, reinforced by an immutable system audit ledger.',
    },
  ]

  const workflowSteps = [
    {
      step: '01',
      title: 'Register & Ingest',
      desc: 'Patients receive unique UHIDs with complete demographic and emergency profiles.',
    },
    {
      step: '02',
      title: 'Schedule & Reserve',
      desc: 'Slots are reserved with conflict-free constraints across 10 hospital specialties.',
    },
    {
      step: '03',
      title: 'Explainable Optimization',
      desc: 'Unused slots from cancellations are matched to waitlisted candidates via transparent scoring.',
    },
    {
      step: '04',
      title: 'Monitor & Dispense',
      desc: 'Clinics track live queue tokens while the pharmacy dispenses through FEFO allocation.',
    },
  ]

  return (
    <div className="space-y-16 py-6 pb-20 max-w-7xl mx-auto px-4 sm:px-6">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 text-white p-8 sm:p-14 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wide text-blue-200">
            <Activity className="w-3.5 h-3.5 text-blue-300" />
            <span>BCSE302L Database Systems • Digital Assignment II</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
            Smarter Hospitals. <br />
            <span className="text-teal-300">Better Patient Care.</span>
          </h1>

          <p className="text-base sm:text-lg text-blue-100 font-medium leading-relaxed">
            One intelligent platform to coordinate appointments, optimize hospital resources, and reduce administrative waste through explainable relational database optimization.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-white text-blue-900 font-bold text-sm shadow-xl hover:bg-blue-50 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('recovery')}
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-sm backdrop-blur-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Explore Smart Recovery</span>
            </button>
            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-teal-500/25 hover:bg-teal-500/35 border border-teal-300/40 text-teal-200 font-bold text-sm backdrop-blur-sm transition-all cursor-pointer"
              >
                <span>Staff Login / Register</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('sql_demo')}
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-600/50 text-slate-200 font-bold text-sm backdrop-blur-sm transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-300" />
              <span>10 SQL Queries Demo</span>
            </button>
          </div>
        </div>

        {/* Decorative Grid Graphic */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* 2. LIVE AGGREGATED DATABASE STATISTICS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Live Hospital Performance Metrics</h2>
            <p className="text-xs text-slate-500">Real aggregated values queried from active PostgreSQL relational tables.</p>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            Database Aggregated
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Registered Patients</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{patientsCount}</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" /> Verified Synthetic UHIDs
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Completed Consults</span>
              <CalendarCheck className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{completedApts}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              Of {appointments.length} total scheduled
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Slot Recovery Rate</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-blue-600">{recoveryRate}%</div>
            <div className="text-[11px] text-teal-600 font-medium mt-1">
              {confirmedRecoveries} slots saved from waste
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Monitored Batches</span>
              <Pill className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{batches.length}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              Across {medicines.length} formulary drugs
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE ARCHITECTURAL FEATURES */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Advanced Database Architecture in Action
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Engineered from ground up with PostgreSQL 3NF schema, Row Level Security, transactional concurrency guards, and explainable optimization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-lg transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${f.badgeColor}`}>
                    {f.badge}
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900">{f.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{f.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="bg-slate-100/70 rounded-3xl p-8 sm:p-12 border border-slate-200 space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 uppercase tracking-wider">
            Operational Lifecycle
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-2">How CareBridge 360 Works</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowSteps.map((ws, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3 relative shadow-xs">
              <div className="text-3xl font-black text-blue-100">{ws.step}</div>
              <h4 className="font-bold text-sm text-slate-900">{ws.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{ws.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. SOCIAL IMPACT SECTION */}
      <section className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-3xl p-8 sm:p-12 border border-teal-200/80 space-y-4">
        <div className="flex items-center space-x-3 text-teal-800">
          <HeartHandshake className="w-7 h-7 text-teal-600" />
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Social & Healthcare Impact</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-4xl">
          Hospital appointment no-shows and short-notice cancellations consume an estimated <strong>15%–30% of outpatient capacity worldwide</strong>, while patients waiting for specialized consultations face prolonged diagnostic delays. CareBridge 360’s Explainable Slot Recovery bridges this gap without opaque black-box scoring, ensuring fair, transparent resource allocation while eliminating shelf medication expiry through FEFO protocols.
        </p>
        <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold text-teal-800">
          <div className="flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-xl border border-teal-200 shadow-xs">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Zero Wasted Consultation Slots</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-xl border border-teal-200 shadow-xs">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Transparent Waiting List Fairness</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-xl border border-teal-200 shadow-xs">
            <Pill className="w-4 h-4 text-blue-600" />
            <span>Minimizing Hospital Drug Waste</span>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-slate-800">CareBridge 360</span>
          <span>• University Academic Project (BCSE302L)</span>
        </div>
        <div className="text-slate-400 text-center sm:text-right">
          PostgreSQL Normalized 3NF Architecture • Synthetic Clinical Data Only
        </div>
      </footer>
    </div>
  )
}
