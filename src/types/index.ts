export type UserRole = 'admin' | 'doctor' | 'receptionist' | 'inventory_manager'

export interface Profile {
  id: string
  full_name: string
  email: string
  phone?: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface StaffRole {
  role_id: string
  user_id: string
  role_name: string
  permissions: string[]
  assigned_by: string
  assigned_at: string
}

export interface Patient {
  patient_id: string
  uhid: string // e.g. "CB-PAT-1001"
  full_name: string
  date_of_birth: string
  gender: 'Male' | 'Female' | 'Other'
  contact_number: string
  email: string
  blood_group?: string
  address: string
  preferred_location?: string
  emergency_contact?: string
  registration_date: string
  created_at?: string
  updated_at?: string
}

export interface Doctor {
  doctor_id: string
  profile_id?: string
  full_name: string
  specialty: string
  department: string
  qualification: string
  consultation_fee: number
  avg_consultation_mins: number
  is_active: boolean
  avatar_url?: string
  created_at?: string
  updated_at?: string
}

export type SlotStatus = 'available' | 'booked' | 'cancelled' | 'blocked'

export interface DoctorSlot {
  slot_id: string
  doctor_id: string
  slot_date: string // YYYY-MM-DD
  start_time: string // HH:mm:ss
  end_time: string // HH:mm:ss
  status: SlotStatus
  created_at?: string
}

export type AppointmentStatus =
  | 'Scheduled'
  | 'Checked In'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled'
  | 'No Show'

export interface Appointment {
  appointment_id: string
  appointment_number: string // e.g. "APT-2026-0042"
  patient_id: string
  doctor_id: string
  slot_id: string
  appointment_date: string
  appointment_time: string
  status: AppointmentStatus
  consultation_notes?: string
  token_number: number
  checked_in_at?: string
  consultation_started_at?: string
  consultation_completed_at?: string
  actual_duration_mins?: number
  created_at?: string
  updated_at?: string
  // Virtual / joined fields
  patient?: Patient
  doctor?: Doctor
  slot?: DoctorSlot
  bill?: Bill
}

export type WaitlistStatus = 'active' | 'matched' | 'fulfilled' | 'expired' | 'cancelled'

export interface Waitlist {
  waitlist_id: string
  patient_id: string
  doctor_id?: string
  specialty: string
  preferred_date: string
  preferred_time_start: string
  preferred_time_end: string
  status: WaitlistStatus
  request_timestamp: string
  created_at?: string
  // Virtual
  patient?: Patient
  doctor?: Doctor
}

export type RecoveryStatus = 'available' | 'candidate_review' | 'confirmed' | 'declined' | 'expired'

export interface SlotRecovery {
  recovery_id: string
  cancelled_appointment_id: string
  slot_id: string
  waitlist_id?: string
  candidate_patient_id?: string
  match_score: number // 0 to 100
  time_compatibility: number // 0 to 1
  waiting_age_factor: number // 0 to 1
  status: RecoveryStatus
  confirmed_at?: string
  confirmed_by?: string
  created_at: string
  // Virtual
  slot?: DoctorSlot
  candidate_patient?: Patient
  cancelled_appointment?: Appointment
}

export type PaymentStatus = 'Pending' | 'Paid' | 'Partially Paid' | 'Cancelled'

export interface Bill {
  bill_id: string
  bill_number: string // e.g. "INV-2026-1011"
  appointment_id: string
  patient_id: string
  consultation_fee: number
  additional_charges: number
  discount: number
  total_amount: number
  payment_status: PaymentStatus
  payment_method?: 'Cash' | 'Card' | 'UPI' | 'Insurance'
  generated_at: string
  updated_at?: string
  // Virtual
  patient?: Patient
  appointment?: Appointment
}

export interface Medicine {
  medicine_id: string
  medicine_code: string // e.g. "MED-AMX-500"
  name: string
  generic_name: string
  category: string
  dosage_form: 'Tablet' | 'Syrup' | 'Injection' | 'Capsule' | 'Ointment'
  unit_of_measure: string
  reorder_level: number
  description?: string
  created_at?: string
  updated_at?: string
  // Virtual aggregated
  total_stock?: number
  batches?: MedicineBatch[]
}

export interface MedicineBatch {
  batch_id: string
  medicine_id: string
  batch_number: string
  manufacture_date: string
  expiry_date: string
  quantity_received: number
  current_stock: number
  unit_purchase_price: number
  unit_selling_price: number
  supplier_name: string
  created_at?: string
  updated_at?: string
  // Virtual
  medicine?: Medicine
  days_to_expiry?: number
  expiry_status?: 'expired' | 'urgent_7d' | 'warning_30d' | 'healthy'
}

export type MovementType =
  | 'INFLOW_RECEIPT'
  | 'OUTFLOW_DISPENSE'
  | 'OUTFLOW_EXPIRED_DISPOSAL'
  | 'ADJUSTMENT'

export interface StockMovement {
  movement_id: string
  batch_id: string
  movement_type: MovementType
  quantity: number
  previous_stock: number
  new_stock: number
  reason: string
  performed_by: string
  movement_timestamp: string
  created_at?: string
  // Virtual
  batch?: MedicineBatch
}

export interface AuditLog {
  log_id: string
  user_id?: string
  action_type: string
  table_name: string
  record_id: string
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  ip_address?: string
  created_at: string
}

// Algorithm & UI Types
export interface CandidateMatch {
  waitlist_id: string
  patient: Patient
  preferred_specialty: string
  preferred_date: string
  preferred_time_window: string
  time_compatibility: number // 0 - 1
  waiting_age_factor: number // 0 - 1
  match_score: number // 0 - 100
  waiting_duration_text: string
  explanation: string
  rank: number
}

export interface DoctorQueueMetrics {
  doctor: Doctor
  current_token: number | null
  active_appointment: Appointment | null
  waiting_appointments: Appointment[]
  completed_count: number
  average_consultation_duration: number
  estimated_wait_minutes: number
}

export interface SimulationMetrics {
  algorithm: 'FCFS (Baseline)' | 'CareBridge Weighted (Proposed)'
  total_cancelled_slots: number
  recovered_slots: number
  recovery_rate: number // %
  avg_patient_wait_days: number
  schedule_compatibility_rate: number // %
  execution_latency_ms: number
  unfilled_loss_prevented_inr: number
}
