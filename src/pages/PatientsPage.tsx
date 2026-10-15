import React, { useState, useEffect } from 'react'
import {
  Users,
  Search,
  Plus,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Clock,
  ReceiptText,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { db } from '../services/db'
import { Patient, Appointment, Bill } from '../types'
import { formatDate, formatCurrency, formatTime } from '../lib/utils'

export const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>([])
  const [patientBills, setPatientBills] = useState<Bill[]>([])
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)

  // Registration form state
  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '1995-05-15',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    contact_number: '+91 98765 ',
    email: '',
    blood_group: 'B+',
    address: '',
    preferred_location: 'Main Campus OPD',
    emergency_contact: '+91 98765 ',
  })

  const loadPatients = () => {
    setPatients(db.getPatients(searchQuery))
  }

  useEffect(() => {
    loadPatients()
  }, [searchQuery])

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setPatientAppointments(db.getAppointments({ patientId: patient.patient_id }))
    setPatientBills(db.getBills().filter((b) => b.patient_id === patient.patient_id))
  }

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newPat = db.registerPatient(formData)
      setNotification(`Registered new patient ${newPat.full_name} with UHID ${newPat.uhid}.`)
      setShowRegisterModal(false)
      loadPatients()
      handleSelectPatient(newPat)
    } catch (err: any) {
      alert(err.message || 'Registration failed')
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">Hospital Patient Directory</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            100 verified synthetic patient records with complete medical history and billing records.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by UHID, Name, Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register Patient</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* TWO COLUMN VIEW: PATIENT LIST + DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* PATIENT LIST */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pb-2 border-b border-slate-100">
            <span>Patients ({patients.length})</span>
            <span>Select to view records</span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {patients.map((p) => {
              const isSelected = selectedPatient?.patient_id === p.patient_id

              return (
                <div
                  key={p.patient_id}
                  onClick={() => handleSelectPatient(p)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-1 ring-blue-500'
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{p.full_name}</span>
                    <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {p.uhid}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center space-x-3">
                    <span>{p.gender} • {p.blood_group || 'O+'}</span>
                    <span>{p.contact_number}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* PATIENT PROFILE DETAILS */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-6">
          {selectedPatient ? (
            <>
              {/* Profile Card */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-extrabold text-slate-900">
                      {selectedPatient.full_name}
                    </h2>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {selectedPatient.blood_group}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-slate-500 mt-0.5">
                    UHID: {selectedPatient.uhid} • Registered: {formatDate(selectedPatient.registration_date)}
                  </div>
                </div>
              </div>

              {/* Demographics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="text-slate-400 font-semibold text-[10px]">DOB / GENDER</div>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedPatient.date_of_birth} ({selectedPatient.gender})</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="text-slate-400 font-semibold text-[10px]">CONTACT PHONE</div>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedPatient.contact_number}</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="text-slate-400 font-semibold text-[10px]">EMAIL ADDRESS</div>
                  <div className="font-bold text-slate-800 mt-0.5 truncate">{selectedPatient.email}</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 col-span-2">
                  <div className="text-slate-400 font-semibold text-[10px]">RESIDENTIAL ADDRESS</div>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedPatient.address}</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="text-slate-400 font-semibold text-[10px]">LOCATION CLINIC</div>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedPatient.preferred_location}</div>
                </div>
              </div>

              {/* Appointment History */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Clinical Appointment History ({patientAppointments.length})</span>
                </h3>

                {patientAppointments.length === 0 ? (
                  <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-xl border">No appointments on file for this patient.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {patientAppointments.map((apt) => (
                      <div
                        key={apt.appointment_id}
                        className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-800">
                            {apt.doctor?.full_name} ({apt.doctor?.specialty})
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {formatDate(apt.appointment_date)} at {formatTime(apt.appointment_time)} • Token #{apt.token_number}
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            apt.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : apt.status === 'Cancelled'
                              ? 'bg-rose-100 text-rose-800 border-rose-200'
                              : 'bg-blue-100 text-blue-800 border-blue-200'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Billing History */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
                  <ReceiptText className="w-4 h-4 text-teal-600" />
                  <span>Billing & Invoices ({patientBills.length})</span>
                </h3>

                {patientBills.length === 0 ? (
                  <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-xl border">No billing records found.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {patientBills.map((b) => (
                      <div
                        key={b.bill_id}
                        className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold font-mono text-slate-800">{b.bill_number}</div>
                          <div className="text-[11px] text-slate-500">{formatDate(b.generated_at)}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-900">{formatCurrency(b.total_amount)}</div>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              b.payment_status === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {b.payment_status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-16 text-center text-slate-400 text-xs">
              Select a patient from the left column to view their medical chart, appointment records, and billing ledger.
            </div>
          )}
        </div>
      </div>

      {/* REGISTER PATIENT MODAL */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Register New Patient</h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="e.g. Ananya Mukherjee"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Phone *</label>
                  <input
                    type="text"
                    required
                    value={formData.contact_number}
                    onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Blood Group</label>
                  <select
                    value={formData.blood_group}
                    onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="patient@example.com"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Residential Address *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Flat/Street, Area, City"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Patient Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
