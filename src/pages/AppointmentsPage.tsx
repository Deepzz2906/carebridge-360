import React, { useState, useEffect } from 'react'
import {
  CalendarDays,
  Clock,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Stethoscope,
  User,
  ReceiptText,
  X
} from 'lucide-react'
import { db } from '../services/db'
import { Appointment, Doctor, Patient, DoctorSlot } from '../types'
import { formatDate, formatTime, formatCurrency } from '../lib/utils'

export const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('all')
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-15')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Booking Form State
  const [bookingPatientId, setBookingPatientId] = useState<string>('')
  const [bookingDoctorId, setBookingDoctorId] = useState<string>('')
  const [bookingDate, setBookingDate] = useState<string>('2026-10-15')
  const [availableSlots, setAvailableSlots] = useState<DoctorSlot[]>([])
  const [selectedSlotId, setSelectedSlotId] = useState<string>('')

  const loadAppointments = () => {
    setAppointments(
      db.getAppointments({
        doctorId: selectedDoctorId === 'all' ? undefined : selectedDoctorId,
        date: selectedDate || undefined,
        status: selectedStatus === 'all' ? undefined : selectedStatus,
      })
    )
  }

  useEffect(() => {
    setDoctors(db.getDoctors())
    setPatients(db.getPatients())
  }, [])

  useEffect(() => {
    loadAppointments()
  }, [selectedDoctorId, selectedDate, selectedStatus])

  // Update available slots when booking doctor/date changes
  useEffect(() => {
    if (bookingDoctorId && bookingDate) {
      const slots = db.getDoctorSlots(bookingDoctorId, bookingDate).filter((s) => s.status === 'available')
      setAvailableSlots(slots)
      if (slots.length > 0) {
        setSelectedSlotId(slots[0].slot_id)
      } else {
        setSelectedSlotId('')
      }
    }
  }, [bookingDoctorId, bookingDate])

  const handleCancelAppointment = (apt: Appointment) => {
    if (confirm(`Are you sure you want to cancel appointment ${apt.appointment_number}? This slot will automatically become available for the Smart Slot Recovery Engine.`)) {
      try {
        db.updateAppointmentStatus(apt.appointment_id, 'Cancelled')
        setNotification(`Appointment ${apt.appointment_number} cancelled. Slot opened for explainable waitlist recovery.`)
        loadAppointments()
      } catch (e: any) {
        setErrorMsg(e.message)
      }
    }
  }

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookingPatientId || !bookingDoctorId || !selectedSlotId) {
      setErrorMsg('Please select patient, doctor, and an available time slot.')
      return
    }

    try {
      const apt = db.bookAppointment({
        patient_id: bookingPatientId,
        doctor_id: bookingDoctorId,
        slot_id: selectedSlotId,
      })
      setNotification(`Booked appointment ${apt.appointment_number} (Token #${apt.token_number}) successfully!`)
      setShowBookingModal(false)
      loadAppointments()
    } catch (err: any) {
      setErrorMsg(err.message || 'Booking failed')
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-4">
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <CalendarDays className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">Hospital Appointment System</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time outpatient bookings, status coordination, and slot recovery triggers.
          </p>
        </div>

        <button
          onClick={() => {
            if (patients.length > 0) setBookingPatientId(patients[0].patient_id)
            if (doctors.length > 0) setBookingDoctorId(doctors[0].doctor_id)
            setShowBookingModal(true)
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Appointment</span>
        </button>
      </div>

      {/* NOTIFICATIONS */}
      {notification && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-300 text-rose-800 p-4 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* FILTER BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-xs">
        <div>
          <label className="font-bold text-slate-600 block mb-1">Appointment Date:</label>
          <input
            type="date"
            aria-label="Filter Appointments by Date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-2 border border-slate-200 rounded-xl"
          />
        </div>

        <div>
          <label className="font-bold text-slate-600 block mb-1">Doctor:</label>
          <select
            aria-label="Filter Appointments by Doctor"
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="w-full p-2 border border-slate-200 rounded-xl"
          >
            <option value="all">All Doctors (All Specialties)</option>
            {doctors.map((d) => (
              <option key={d.doctor_id} value={d.doctor_id}>
                {d.full_name} ({d.specialty})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-bold text-slate-600 block mb-1">Status:</label>
          <select
            aria-label="Filter Appointments by Status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full p-2 border border-slate-200 rounded-xl"
          >
            <option value="all">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Checked In">Checked In</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="No Show">No Show</option>
          </select>
        </div>
      </div>

      {/* APPOINTMENTS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-sm">Outpatient Consultation Schedule</h2>
          <span className="text-[11px] font-bold text-slate-500">{appointments.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <th className="py-3 px-4">Token & ID</th>
                <th className="py-3 px-4">Patient (UHID)</th>
                <th className="py-3 px-4">Doctor & Specialty</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Consultation Duration</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No appointments match the selected filters.
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => {
                  const isCancelled = apt.status === 'Cancelled'
                  const isCompleted = apt.status === 'Completed'

                  return (
                    <tr key={apt.appointment_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-blue-600">Token #{apt.token_number}</div>
                        <div className="text-[10px] font-mono text-slate-400">{apt.appointment_number}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{apt.patient?.full_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{apt.patient?.uhid}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{apt.doctor?.full_name}</div>
                        <div className="text-[10px] text-slate-500">{apt.doctor?.specialty}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-700">{formatDate(apt.appointment_date)}</div>
                        <div className="text-[10px] text-slate-400 font-semibold">{formatTime(apt.appointment_time)}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : isCancelled
                              ? 'bg-rose-100 text-rose-800 border-rose-200'
                              : apt.status === 'In Progress'
                              ? 'bg-teal-100 text-teal-800 border-teal-200'
                              : apt.status === 'Checked In'
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-blue-100 text-blue-800 border-blue-200'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {apt.actual_duration_mins ? `${apt.actual_duration_mins} mins` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!isCancelled && !isCompleted && (
                          <button
                            onClick={() => handleCancelAppointment(apt)}
                            className="px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                          >
                            Cancel Slot
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* BOOKING MODAL */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Schedule New Outpatient Slot</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Patient *</label>
                <select
                  required
                  value={bookingPatientId}
                  onChange={(e) => setBookingPatientId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  {patients.map((p) => (
                    <option key={p.patient_id} value={p.patient_id}>
                      {p.full_name} ({p.uhid})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Doctor *</label>
                <select
                  required
                  value={bookingDoctorId}
                  onChange={(e) => setBookingDoctorId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  {doctors.map((d) => (
                    <option key={d.doctor_id} value={d.doctor_id}>
                      {d.full_name} — {d.specialty} ({formatCurrency(d.consultation_fee)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Consultation Date *</label>
                <input
                  type="date"
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Available Doctor Slots *</label>
                {availableSlots.length === 0 ? (
                  <p className="text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                    No available slots on this date for the selected doctor.
                  </p>
                ) : (
                  <select
                    required
                    value={selectedSlotId}
                    onChange={(e) => setSelectedSlotId(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold text-blue-700"
                  >
                    {availableSlots.map((s) => (
                      <option key={s.slot_id} value={s.slot_id}>
                        {formatTime(s.start_time)} - {formatTime(s.end_time)}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={availableSlots.length === 0}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-xs"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
