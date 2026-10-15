import React, { useState, useEffect } from 'react'
import {
  Stethoscope,
  Plus,
  Clock,
  IndianRupee,
  Calendar,
  CheckCircle2,
  X,
  Search,
  Award,
  Building2,
  Sliders
} from 'lucide-react'
import { db } from '../services/db'
import { Doctor } from '../types'
import { formatCurrency } from '../lib/utils'

export const DoctorsPage: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
  const [notification, setNotification] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    full_name: '',
    specialty: 'Cardiology',
    department: 'Cardiovascular Sciences',
    qualification: 'MBBS, MD',
    consultation_fee: 650,
    avg_consultation_mins: 15,
    is_active: true,
  })

  const loadDoctors = () => {
    setDoctors(db.getDoctors())
  }

  useEffect(() => {
    loadDoctors()
  }, [])

  const handleEditDoctor = (doc: Doctor) => {
    setEditingDoctor(doc)
    setFormData({
      full_name: doc.full_name,
      specialty: doc.specialty,
      department: doc.department,
      qualification: doc.qualification,
      consultation_fee: doc.consultation_fee,
      avg_consultation_mins: doc.avg_consultation_mins,
      is_active: doc.is_active,
    })
    setShowAddModal(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingDoctor) {
      db.updateDoctor(editingDoctor.doctor_id, formData)
      setNotification(`Updated profile for ${formData.full_name}.`)
    } else {
      db.addDoctor(formData)
      setNotification(`Added new consultant ${formData.full_name}.`)
    }
    setShowAddModal(false)
    setEditingDoctor(null)
    loadDoctors()
  }

  const specialties = ['all', ...Array.from(new Set(doctors.map((d) => d.specialty)))]

  const filteredDoctors = doctors.filter((d) => {
    if (selectedSpecialty !== 'all' && d.specialty !== selectedSpecialty) return false
    return true
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <Stethoscope className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">Hospital Medical Faculty</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            10 specialized departments with configured consultation durations and fees.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingDoctor(null)
            setFormData({
              full_name: '',
              specialty: 'Cardiology',
              department: 'Cardiovascular Sciences',
              qualification: 'MBBS, MD',
              consultation_fee: 650,
              avg_consultation_mins: 15,
              is_active: true,
            })
            setShowAddModal(true)
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Doctor</span>
        </button>
      </div>

      {notification && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* SPECIALTY FILTER CHIPS */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {specialties.map((spec) => (
          <button
            key={spec}
            onClick={() => setSelectedSpecialty(spec)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all ${
              selectedSpecialty === spec
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {spec}
          </button>
        ))}
      </div>

      {/* DOCTOR CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doc) => {
          const slots = db.getDoctorSlots(doc.doctor_id, '2026-10-15')
          const bookedSlots = slots.filter((s) => s.status === 'booked').length

          return (
            <div
              key={doc.doctor_id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 p-5 shadow-xs hover:shadow-md transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{doc.full_name}</h3>
                  <div className="text-xs font-semibold text-blue-600">{doc.specialty}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{doc.department}</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {doc.is_active ? 'Active OPD' : 'On Leave'}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center space-x-1">
                    <Award className="w-3.5 h-3.5 text-slate-400" />
                    <span>Credentials:</span>
                  </span>
                  <strong className="text-slate-800">{doc.qualification}</strong>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center space-x-1">
                    <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                    <span>Consultation Fee:</span>
                  </span>
                  <strong className="text-slate-800">{formatCurrency(doc.consultation_fee)}</strong>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Avg Consultation:</span>
                  </span>
                  <strong className="text-slate-800">{doc.avg_consultation_mins} mins</strong>
                </div>
              </div>

              {/* Slot Utilization Mini-Bar */}
              <div className="pt-1">
                <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                  <span>Today's Slot Utilization:</span>
                  <span className="font-bold text-slate-800">{bookedSlots} / {slots.length} Slots</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full"
                    style={{ width: `${(bookedSlots / (slots.length || 1)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleEditDoctor(doc)}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                >
                  Edit Profile & Schedule
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* ADD / EDIT DOCTOR MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                {editingDoctor ? 'Edit Doctor Profile' : 'Add New Hospital Doctor'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Doctor Name *</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="e.g. Dr. Priya Sundaram"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Specialty *</label>
                  <input
                    type="text"
                    required
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Department *</label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Qualifications *</label>
                <input
                  type="text"
                  required
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  placeholder="e.g. MBBS, MD, DM"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Consultation Fee (INR) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.consultation_fee}
                    onChange={(e) => setFormData({ ...formData, consultation_fee: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Avg Duration (Mins) *</label>
                  <input
                    type="number"
                    required
                    min={5}
                    max={60}
                    value={formData.avg_consultation_mins}
                    onChange={(e) => setFormData({ ...formData, avg_consultation_mins: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Doctor Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
