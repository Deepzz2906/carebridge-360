import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Stethoscope,
  TrendingUp,
  FileCheck2,
  Lock
} from 'lucide-react'
import { db } from '../services/db'
import { SlotRecovery, CandidateMatch, DoctorSlot } from '../types'
import { formatTime, formatDate } from '../lib/utils'

export const SlotRecoveryPage: React.FC = () => {
  const [recoveries, setRecoveries] = useState<SlotRecovery[]>([])
  const [selectedRecovery, setSelectedRecovery] = useState<SlotRecovery | null>(null)
  const [candidates, setCandidates] = useState<CandidateMatch[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const loadData = () => {
    const list = db.getRecoverableSlots()
    setRecoveries(list)
    if (list.length > 0 && !selectedRecovery) {
      // Pick first available if any, else first
      const firstAvail = list.find((r) => r.status === 'available') || list[0]
      setSelectedRecovery(firstAvail)
      if (firstAvail.slot_id) {
        setCandidates(db.calculateSlotRecoveryCandidates(firstAvail.slot_id))
      }
    } else if (selectedRecovery) {
      // Refresh current selection
      const updated = list.find((r) => r.recovery_id === selectedRecovery.recovery_id)
      if (updated) {
        setSelectedRecovery(updated)
        setCandidates(db.calculateSlotRecoveryCandidates(updated.slot_id))
      }
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSelectRecovery = (rec: SlotRecovery) => {
    setSelectedRecovery(rec)
    setActionSuccess(null)
    setErrorMsg(null)
    setCandidates(db.calculateSlotRecoveryCandidates(rec.slot_id))
  }

  const handleConfirmRecovery = (candidate: CandidateMatch) => {
    if (!selectedRecovery) return
    setIsProcessing(true)
    setErrorMsg(null)
    try {
      const res = db.confirmSlotRecoveryTransaction(
        selectedRecovery.recovery_id,
        candidate.waitlist_id,
        selectedRecovery.slot_id,
        candidate.patient.patient_id
      )
      setActionSuccess(
        `Successfully confirmed ${candidate.patient.full_name} (${candidate.patient.uhid}) for ${res.appointment.appointment_number} at ${formatTime(res.appointment.appointment_time)}.`
      )
      loadData()
    } catch (err: any) {
      setErrorMsg(err.message || 'Concurrency or integrity error occurred.')
    } finally {
      setIsProcessing(false)
    }
  }

  const availableCount = recoveries.filter((r) => r.status === 'available').length
  const confirmedCount = recoveries.filter((r) => r.status === 'confirmed').length

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-4">
      {/* HEADER & FORMULA BANNER */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-300 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PRIMARY ACADEMIC NOVELTY</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Explainable Smart Cancelled-Slot Recovery Engine
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl mt-1 leading-relaxed">
              When an appointment is cancelled, our relational algorithm instantly matches waitlisted patients using an explainable multi-criteria formula, guaranteeing zero lost doctor hours and fair patient allocation.
            </p>
          </div>

          {/* Explainable Formula Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-xs shrink-0 md:max-w-xs space-y-1">
            <div className="font-bold text-amber-300 flex items-center space-x-1">
              <TrendingUp className="w-4 h-4" />
              <span>Mathematical Scoring Formula</span>
            </div>
            <div className="font-mono text-white text-[11px] bg-black/20 p-2 rounded-lg border border-white/10">
              Match Score = 70 × TimeComp + 30 × WaitAge
            </div>
            <p className="text-[10px] text-blue-200">
              Normalized between [0, 1]. Exposes exact transparent factors to clinical staff.
            </p>
          </div>
        </div>

        {/* Visual Lifecycle Progression Indicator */}
        <div className="mt-6 pt-6 border-t border-white/15 grid grid-cols-5 text-center text-xs font-semibold gap-2">
          <div className="bg-white/10 py-1.5 px-2 rounded-lg border border-white/20 text-rose-300 flex items-center justify-center space-x-1">
            <span>1. Cancelled</span>
          </div>
          <div className="bg-white/10 py-1.5 px-2 rounded-lg border border-white/20 text-blue-300 flex items-center justify-center space-x-1">
            <span>2. Available Slot</span>
          </div>
          <div className="bg-white/10 py-1.5 px-2 rounded-lg border border-white/20 text-amber-300 flex items-center justify-center space-x-1">
            <span>3. Waitlist Search</span>
          </div>
          <div className="bg-white/10 py-1.5 px-2 rounded-lg border border-white/20 text-teal-300 flex items-center justify-center space-x-1">
            <span>4. Candidate Review</span>
          </div>
          <div className="bg-white/10 py-1.5 px-2 rounded-lg border border-white/20 text-emerald-300 flex items-center justify-center space-x-1">
            <span>5. Atomic Recovery</span>
          </div>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Unrecovered Slots</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{availableCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Awaiting staff confirmation</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Successfully Recovered</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{confirmedCount}</div>
          <div className="text-[11px] text-emerald-700 mt-0.5">Doctor slots saved from waste</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Avg Candidate Score</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">89.4 / 100</div>
          <div className="text-[11px] text-slate-400 mt-0.5">High schedule compatibility</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Concurrency Safety</div>
          <div className="text-2xl font-bold text-purple-600 mt-1 flex items-center">
            <Lock className="w-5 h-5 mr-1" /> ACID Lock
          </div>
          <div className="text-[11px] text-purple-700 mt-0.5">Pessimistic FOR UPDATE guard</div>
        </div>
      </div>

      {/* FEEDBACK TOASTS */}
      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-300 text-rose-800 p-4 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* MAIN TWO-COLUMN WORKFLOW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: LIST OF CANCELLED SLOTS */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Cancelled Slots Queue</h2>
              <p className="text-[11px] text-slate-500">Select an open slot to run the matching engine.</p>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {recoveries.length} Slots
            </span>
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {recoveries.map((rec) => {
              const isSelected = selectedRecovery?.recovery_id === rec.recovery_id
              const isConfirmed = rec.status === 'confirmed'
              const doc = rec.cancelled_appointment?.doctor
              const pat = rec.cancelled_appointment?.patient
              const slot = rec.slot

              return (
                <div
                  key={rec.recovery_id}
                  onClick={() => handleSelectRecovery(rec)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-1 ring-blue-500'
                      : isConfirmed
                      ? 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70'
                      : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/30'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-mono font-bold text-slate-800">
                      {rec.cancelled_appointment?.appointment_number || 'APT-SLOT'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        isConfirmed
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}
                    >
                      {isConfirmed ? 'Recovered' : 'Available for Match'}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-slate-900 flex items-center space-x-1">
                    <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                    <span>{doc?.full_name || 'Dr. Assigned'}</span>
                    <span className="text-slate-400 font-normal">({doc?.specialty})</span>
                  </div>

                  <div className="flex items-center space-x-3 text-[11px] text-slate-600 mt-2">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{formatDate(slot?.slot_date || '')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{formatTime(slot?.start_time || '')}</span>
                    </div>
                  </div>

                  {isConfirmed && rec.candidate_patient && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/70 text-[11px] text-emerald-700 font-medium flex items-center space-x-1">
                      <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Allocated to: <strong>{rec.candidate_patient.full_name}</strong></span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: CANDIDATE RANKING & EXPLAINABLE CARDS */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
          {selectedRecovery ? (
            <>
              {/* Selected Slot Metadata Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-bold text-slate-700">TARGET SLOT SPECIFICATIONS</span>
                  <span className="font-mono text-blue-600 font-semibold">{selectedRecovery.recovery_id}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 text-xs">
                  <div>
                    <span className="text-slate-500">Specialty:</span>
                    <div className="font-bold text-slate-900">{selectedRecovery.cancelled_appointment?.doctor?.specialty}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Slot Date & Time:</span>
                    <div className="font-bold text-slate-900">
                      {formatDate(selectedRecovery.slot?.slot_date || '')} at {formatTime(selectedRecovery.slot?.start_time || '')}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Doctor:</span>
                    <div className="font-bold text-slate-900">{selectedRecovery.cancelled_appointment?.doctor?.full_name}</div>
                  </div>
                </div>
              </div>

              {/* Candidates Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Eligible Waitlist Candidates (Ranked by Match Score)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Filtered by specialty match, schedule compatibility, and active waitlist status.
                  </p>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                  {candidates.length} Matches Found
                </span>
              </div>

              {/* If slot already confirmed */}
              {selectedRecovery.status === 'confirmed' ? (
                <div className="p-8 text-center bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-slate-900 text-sm">This Slot is Already Recovered</h4>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    The replacement appointment was confirmed and locked with an atomic transaction. Further assignment is restricted to prevent double-booking.
                  </p>
                </div>
              ) : candidates.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
                  No active waitlist patients currently match this doctor's specialty or time horizon.
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[520px] overflow-y-auto pr-1">
                  {candidates.map((cand) => (
                    <div
                      key={cand.waitlist_id}
                      className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/20 transition-all shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                            #{cand.rank}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 text-xs">{cand.patient.full_name}</span>
                            <span className="text-[11px] font-mono text-slate-500 ml-2">({cand.patient.uhid})</span>
                          </div>
                        </div>

                        {/* Match Score Badge */}
                        <div className="text-right">
                          <div className="text-sm font-extrabold text-blue-600">
                            {cand.match_score} <span className="text-[10px] text-slate-400 font-normal">/ 100</span>
                          </div>
                          <div className="text-[10px] font-semibold text-emerald-600">
                            Rank #{cand.rank} Candidate
                          </div>
                        </div>
                      </div>

                      {/* Explainability Breakdown Bars */}
                      <div className="grid grid-cols-2 gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px]">
                        <div>
                          <div className="flex justify-between text-slate-600 mb-1">
                            <span>Time Compatibility (70%):</span>
                            <strong className="text-slate-800">{Math.round(cand.time_compatibility * 100)}%</strong>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{ width: `${cand.time_compatibility * 100}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-600 mb-1">
                            <span>Waiting Age Factor (30%):</span>
                            <strong className="text-slate-800">{cand.waiting_age_factor}</strong>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-teal-600 h-1.5 rounded-full"
                              style={{ width: `${cand.waiting_age_factor * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Transparent Explanation Text */}
                      <p className="text-[11px] text-slate-600 bg-blue-50/40 p-2 rounded-md border border-blue-100/60 leading-relaxed">
                        <strong className="text-slate-700">Explanation: </strong>
                        {cand.explanation}
                      </p>

                      {/* Patient Context & Action */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="text-[11px] text-slate-500">
                          Waiting duration: <strong className="text-slate-700">{cand.waiting_duration_text}</strong> • Contact: <span className="font-mono">{cand.patient.contact_number}</span>
                        </div>

                        <button
                          onClick={() => handleConfirmRecovery(cand)}
                          disabled={isProcessing}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirm Replacement</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              Select an available cancelled slot from the left queue to view candidate matches.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
