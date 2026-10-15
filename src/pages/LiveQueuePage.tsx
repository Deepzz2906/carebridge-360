import React, { useState, useEffect } from 'react'
import {
  Clock,
  UserCheck,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Users,
  Timer,
  ChevronRight,
  TrendingDown,
  Info
} from 'lucide-react'
import { db } from '../services/db'
import { Doctor, DoctorQueueMetrics, Appointment } from '../types'
import { formatTime } from '../lib/utils'

export const LiveQueuePage: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('')
  const [queueMetrics, setQueueMetrics] = useState<DoctorQueueMetrics | null>(null)
  const [actualDurationInput, setActualDurationInput] = useState<number>(15)
  const [notesInput, setNotesInput] = useState<string>('')
  const [notification, setNotification] = useState<string | null>(null)

  useEffect(() => {
    const docList = db.getDoctors()
    setDoctors(docList)
    if (docList.length > 0 && !selectedDoctorId) {
      setSelectedDoctorId(docList[0].doctor_id)
      setQueueMetrics(db.getDoctorQueue(docList[0].doctor_id))
    }
  }, [])

  const handleDoctorChange = (id: string) => {
    setSelectedDoctorId(id)
    setQueueMetrics(db.getDoctorQueue(id))
    setNotification(null)
  }

  const refreshQueue = () => {
    if (selectedDoctorId) {
      setQueueMetrics(db.getDoctorQueue(selectedDoctorId))
    }
  }

  const handleCheckIn = (apt: Appointment) => {
    db.updateAppointmentStatus(apt.appointment_id, 'Checked In')
    setNotification(`Patient ${apt.patient?.full_name} (Token #${apt.token_number}) marked Checked In.`)
    refreshQueue()
  }

  const handleStartConsultation = (apt: Appointment) => {
    db.updateAppointmentStatus(apt.appointment_id, 'In Progress')
    setNotification(`Started consultation for Token #${apt.token_number} (${apt.patient?.full_name}).`)
    refreshQueue()
  }

  const handleCompleteConsultation = (apt: Appointment) => {
    const duration = actualDurationInput > 0 ? actualDurationInput : 15
    db.updateAppointmentStatus(apt.appointment_id, 'Completed', notesInput, duration)
    setNotification(`Completed consultation for Token #${apt.token_number}. Recorded actual duration: ${duration} mins.`)
    setNotesInput('')
    refreshQueue()
  }

  if (!queueMetrics) {
    return <div className="p-8 text-center text-slate-500">Loading live queue...</div>
  }

  const {
    doctor,
    current_token,
    active_appointment,
    waiting_appointments,
    completed_count,
    average_consultation_duration,
    estimated_wait_minutes,
  } = queueMetrics

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-4">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-teal-200 mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>SECONDARY ACADEMIC NOVELTY</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Live Queue Estimation & Dynamic Token Board
            </h1>
            <p className="text-xs sm:text-sm text-teal-100 max-w-2xl mt-1 leading-relaxed">
              Real-time patient progression tracking with dynamically learned consultation durations. Estimates recalculate automatically on check-in, consultation start, and completion.
            </p>
          </div>

          {/* Doctor Switcher */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 shrink-0">
            <label className="text-[10px] font-bold text-teal-200 uppercase tracking-wider block mb-1">
              Select Clinic Doctor
            </label>
            <select
              aria-label="Filter Queue by Doctor"
              value={selectedDoctorId}
              onChange={(e) => handleDoctorChange(e.target.value)}
              className="bg-white text-slate-800 text-xs font-bold rounded-lg px-3 py-2 border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              {doctors.map((d) => (
                <option key={d.doctor_id} value={d.doctor_id}>
                  {d.full_name} ({d.specialty})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* LIVE TOKEN BOARD & METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* CURRENT SERVING TOKEN */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>NOW SERVING TOKEN</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <div className="my-2">
            <span className="text-5xl font-black text-blue-600">
              {current_token ? `#${current_token}` : '—'}
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            {active_appointment ? (
              <span className="font-semibold text-slate-800">
                {active_appointment.patient?.full_name} ({active_appointment.patient?.uhid})
              </span>
            ) : (
              'No consultation in progress'
            )}
          </div>
        </div>

        {/* PATIENTS WAITING */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>PATIENTS WAITING</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="my-2">
            <span className="text-4xl font-extrabold text-slate-900">
              {waiting_appointments.length}
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            In clinic reception waiting room
          </div>
        </div>

        {/* DYNAMIC ESTIMATED WAIT TIME */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>ESTIMATED WAIT TIME</span>
            <Timer className="w-4 h-4 text-amber-500" />
          </div>
          <div className="my-2">
            <span className="text-4xl font-extrabold text-amber-600">
              ~{estimated_wait_minutes} <span className="text-sm font-normal text-slate-400">mins</span>
            </span>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center">
            <Info className="w-3 h-3 mr-1" /> Dynamic empirical estimate
          </div>
        </div>

        {/* CONSULTATION PACE & AVERAGE */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>EMPIRICAL AVG DURATION</span>
            <TrendingDown className="w-4 h-4 text-purple-600" />
          </div>
          <div className="my-2">
            <span className="text-4xl font-extrabold text-purple-700">
              {average_consultation_duration} <span className="text-sm font-normal text-slate-400">mins/pt</span>
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            {completed_count} completed consultations today
          </div>
        </div>
      </div>

      {/* ACTIVE CONSULTATION DESK & QUEUE PROGRESS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* DOCTOR DESK: ACTIVE CONSULTATION CONTROL */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Stethoscope className="w-5 h-5 text-teal-600" />
              <h2 className="font-bold text-slate-900 text-sm">Doctor Consultation Chamber</h2>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
              {doctor.department}
            </span>
          </div>

          {active_appointment ? (
            <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">
                    CONSULTATION IN PROGRESS
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-base mt-0.5">
                    {active_appointment.patient?.full_name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    UHID: {active_appointment.patient?.uhid} • Age/Gender: {active_appointment.patient?.gender}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-blue-700">Token #{active_appointment.token_number}</div>
                  <div className="text-[11px] text-slate-500">Slot: {formatTime(active_appointment.appointment_time)}</div>
                </div>
              </div>

              {/* Consultation Notes Input */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Clinical Examination & Prescription Notes:
                </label>
                <textarea
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Record diagnosis summary, vital observations, prescribed drugs..."
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                />
              </div>

              {/* Actual Duration Input for empirical learning */}
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-700">
                  Actual Duration (Mins):
                </span>
                <input
                  type="number"
                  aria-label="Actual Duration in Minutes"
                  value={actualDurationInput}
                  onChange={(e) => setActualDurationInput(Number(e.target.value))}
                  min={1}
                  max={120}
                  className="w-20 text-xs font-bold p-1.5 border border-slate-300 rounded-lg text-center"
                />
              </div>

              {/* Complete Consultation Button */}
              <button
                onClick={() => handleCompleteConsultation(active_appointment)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Consultation & Dispatch Bill</span>
              </button>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <UserCheck className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="font-bold text-slate-700 text-xs">No Patient Currently with Doctor</h4>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Call the next waiting patient from the queue on the right to start consultation.
              </p>
            </div>
          )}
        </div>

        {/* LIVE WAITING ROOM QUEUE */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Today's Appointment Queue</h2>
              <p className="text-[11px] text-slate-500">
                Ordered by assigned token number. Click to check in or start consultation.
              </p>
            </div>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
              {waiting_appointments.length} Ahead
            </span>
          </div>

          <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
            {waiting_appointments.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
                All scheduled appointments for this doctor have been completed!
              </div>
            ) : (
              waiting_appointments.map((apt, index) => {
                const isCheckedIn = apt.status === 'Checked In'
                const estDelay = index * average_consultation_duration

                return (
                  <div
                    key={apt.appointment_id}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-teal-300 bg-white hover:bg-teal-50/20 transition-all flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center font-black text-slate-800 text-xs">
                        <span className="text-[8px] text-slate-400 uppercase font-bold">TOKEN</span>
                        #{apt.token_number}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs flex items-center space-x-2">
                          <span>{apt.patient?.full_name}</span>
                          <span className="text-[10px] font-mono text-slate-400">({apt.patient?.uhid})</span>
                        </div>
                        <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-1">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Scheduled: {formatTime(apt.appointment_time)}</span>
                          </span>
                          <span className="font-semibold text-amber-600">
                            Est. Wait: ~{estDelay} mins
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          isCheckedIn
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {apt.status}
                      </span>

                      {!isCheckedIn ? (
                        <button
                          onClick={() => handleCheckIn(apt)}
                          className="px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors cursor-pointer"
                        >
                          Check In
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartConsultation(apt)}
                          disabled={Boolean(active_appointment)}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 rounded-lg shadow-xs transition-colors flex items-center space-x-1 cursor-pointer"
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          <span>Call In</span>
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
