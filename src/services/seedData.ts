import {
  Patient,
  Doctor,
  DoctorSlot,
  Appointment,
  Waitlist,
  SlotRecovery,
  Bill,
  Medicine,
  MedicineBatch,
  StockMovement,
  Profile,
  AuditLog
} from '../types'

// Pseudo-random number generator with fixed seed for 100% reproducible test runs
class PRNG {
  private s: number
  constructor(seed: number = 20261015) {
    this.s = seed % 2147483647
    if (this.s <= 0) this.s += 2147483646
  }
  next(): number {
    this.s = (this.s * 16807) % 2147483647
    return (this.s - 1) / 2147483646
  }
  range(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }
  choice<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)]
  }
}

export function generateSeedData() {
  const rng = new PRNG(20261015)

  // 1. PROFILES (4 Pre-configured System Users for the 4 Roles)
  const profiles: Profile[] = [
    {
      id: 'usr-admin-01',
      full_name: 'Dr. Rajesh Ramanathan',
      email: 'admin@carebridge360.local',
      phone: '+91 98765 00001',
      role: 'admin',
      created_at: '2026-09-01T08:00:00Z',
      updated_at: '2026-09-01T08:00:00Z',
    },
    {
      id: 'usr-doc-01',
      full_name: 'Dr. Priya Sundaram',
      email: 'doctor@carebridge360.local',
      phone: '+91 98765 00002',
      role: 'doctor',
      created_at: '2026-09-01T08:00:00Z',
      updated_at: '2026-09-01T08:00:00Z',
    },
    {
      id: 'usr-rec-01',
      full_name: 'Ananya Krishnan',
      email: 'receptionist@carebridge360.local',
      phone: '+91 98765 00003',
      role: 'receptionist',
      created_at: '2026-09-01T08:00:00Z',
      updated_at: '2026-09-01T08:00:00Z',
    },
    {
      id: 'usr-inv-01',
      full_name: 'Karthik Narayanan',
      email: 'pharmacy@carebridge360.local',
      phone: '+91 98765 00004',
      role: 'inventory_manager',
      created_at: '2026-09-01T08:00:00Z',
      updated_at: '2026-09-01T08:00:00Z',
    },
  ]

  // 2. DOCTORS (10 Specialized Doctors)
  const doctorSpecs = [
    { name: 'Dr. Priya Sundaram', specialty: 'Cardiology', dept: 'Cardiovascular Sciences', qual: 'MBBS, MD, DM (Cardio)', fee: 800, mins: 20 },
    { name: 'Dr. Vikram Malhotra', specialty: 'Neurology', dept: 'Neurosciences', qual: 'MBBS, MD, DM (Neuro)', fee: 900, mins: 25 },
    { name: 'Dr. Anita Deshmukh', specialty: 'Orthopedics', dept: 'Musculoskeletal Care', qual: 'MBBS, MS (Ortho)', fee: 700, mins: 15 },
    { name: 'Dr. Arvind Swaminathan', specialty: 'Pediatrics', dept: 'Child Health', qual: 'MBBS, MD (Pediatrics)', fee: 600, mins: 15 },
    { name: 'Dr. Sneha Roy', specialty: 'General Medicine', dept: 'Internal Medicine', qual: 'MBBS, MD (Medicine)', fee: 500, mins: 15 },
    { name: 'Dr. Farhan Qureshi', specialty: 'Oncology', dept: 'Cancer Institute', qual: 'MBBS, MD, DNB (Oncology)', fee: 1000, mins: 30 },
    { name: 'Dr. Meera Nambiar', specialty: 'Dermatology', dept: 'Dermatology & Cosmetology', qual: 'MBBS, MD (DVL)', fee: 650, mins: 15 },
    { name: 'Dr. Suresh Varma', specialty: 'ENT', dept: 'Otorhinolaryngology', qual: 'MBBS, MS (ENT)', fee: 550, mins: 15 },
    { name: 'Dr. Radhika Sen', specialty: 'Ophthalmology', dept: 'Eye Care Center', qual: 'MBBS, MS (Ophthal)', fee: 600, mins: 15 },
    { name: 'Dr. Kabir Anand', specialty: 'Gastroenterology', dept: 'Digestive Health', qual: 'MBBS, MD, DM (Gastro)', fee: 850, mins: 20 },
  ]

  const doctors: Doctor[] = doctorSpecs.map((d, idx) => ({
    doctor_id: `doc-${idx + 1}`,
    profile_id: idx === 0 ? 'usr-doc-01' : undefined,
    full_name: d.name,
    specialty: d.specialty,
    department: d.dept,
    qualification: d.qual,
    consultation_fee: d.fee,
    avg_consultation_mins: d.mins,
    is_active: true,
    created_at: '2026-09-01T09:00:00Z',
    updated_at: '2026-09-01T09:00:00Z',
  }))

  // 3. PATIENTS (100 Synthetic Patient Records)
  const firstNames = [
    'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
    'Shaurya', 'Atharva', 'Advik', 'Pranav', 'Advaith', 'Kabir', 'Dhruv', 'Darsh', 'Utkarsh', 'Rudra',
    'Diya', 'Saanvi', 'Ananya', 'Aadhya', 'Pari', 'Anika', 'Navya', 'Myra', 'Kavya', 'Gauri',
    'Avni', 'Riya', 'Arya', 'Isha', 'Ahana', 'Anvi', 'Sara', 'Meera', 'Roshni', 'Tanvi',
    'Bhavin', 'Chetan', 'Deepak', 'Ganesh', 'Harish', 'Jatin', 'Kamal', 'Lalit', 'Manoj', 'Naveen'
  ]
  const lastNames = [
    'Sharma', 'Verma', 'Patel', 'Iyer', 'Menon', 'Reddy', 'Chatterjee', 'Gupta', 'Singh', 'Banerjee',
    'Deshmukh', 'Kulkarni', 'Joshi', 'Mehta', 'Nair', 'Pillai', 'Rao', 'Bhat', 'Hegde', 'Choudhury'
  ]
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  const locations = ['Main Campus OPD', 'City Annex Clinic', 'North Wing Center', 'South Pavilion']

  const patients: Patient[] = []
  for (let i = 1; i <= 100; i++) {
    const fName = firstNames[(i * 7) % firstNames.length]
    const lName = lastNames[(i * 13) % lastNames.length]
    const gender = i % 2 === 0 ? 'Female' : 'Male'
    const birthYear = 1955 + (i % 50)
    const birthMonth = String((i % 12) + 1).padStart(2, '0')
    const birthDay = String((i % 28) + 1).padStart(2, '0')
    
    patients.push({
      patient_id: `pat-${i.toString().padStart(3, '0')}`,
      uhid: `CB-PAT-${(1000 + i).toString()}`,
      full_name: `${fName} ${lName}`,
      date_of_birth: `${birthYear}-${birthMonth}-${birthDay}`,
      gender: gender as 'Male' | 'Female',
      contact_number: `+91 9${rng.range(100000000, 999999999)}`,
      email: `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@example.com`,
      blood_group: bloodGroups[i % bloodGroups.length],
      address: `${rng.range(12, 450)}, Cross St, Sector ${rng.range(1, 24)}, Metro City`,
      preferred_location: locations[i % locations.length],
      emergency_contact: `+91 9${rng.range(100000000, 999999999)}`,
      registration_date: '2026-09-10',
      created_at: '2026-09-10T10:00:00Z',
    })
  }

  // 4. DOCTOR SLOTS & APPOINTMENTS (200 Appointments across slots)
  const doctorSlots: DoctorSlot[] = []
  const appointments: Appointment[] = []
  const bills: Bill[] = []
  const slotRecoveries: SlotRecovery[] = []

  const timeSlots = [
    { start: '09:00:00', end: '09:30:00' },
    { start: '09:30:00', end: '10:00:00' },
    { start: '10:00:00', end: '10:30:00' },
    { start: '10:30:00', end: '11:00:00' },
    { start: '11:00:00', end: '11:30:00' },
    { start: '11:30:00', end: '12:00:00' },
    { start: '14:00:00', end: '14:30:00' },
    { start: '14:30:00', end: '15:00:00' },
    { start: '15:00:00', end: '15:30:00' },
    { start: '15:30:00', end: '16:00:00' },
  ]

  // Dates: recent 5 days + today + next 3 days
  const baseDates = [
    '2026-10-11',
    '2026-10-12',
    '2026-10-13',
    '2026-10-14',
    '2026-10-15', // Today
    '2026-10-16',
    '2026-10-17',
    '2026-10-18',
  ]

  let slotCounter = 1
  let aptCounter = 1

  // Generate slots for each doctor across days
  doctors.forEach((doc) => {
    baseDates.forEach((dateStr) => {
      timeSlots.forEach((ts) => {
        const slotId = `slot-${slotCounter++}`
        doctorSlots.push({
          slot_id: slotId,
          doctor_id: doc.doctor_id,
          slot_date: dateStr,
          start_time: ts.start,
          end_time: ts.end,
          status: 'available',
          created_at: '2026-10-01T08:00:00Z',
        })
      })
    })
  })

  // Create 200 appointments by selecting slots
  const selectedSlots = doctorSlots.slice(0, 200)

  selectedSlots.forEach((slot, idx) => {
    const aptId = `apt-${aptCounter}`
    const aptNumber = `APT-2026-${(1000 + aptCounter).toString()}`
    const patient = patients[idx % patients.length]
    const doc = doctors.find((d) => d.doctor_id === slot.doctor_id)!
    const isToday = slot.slot_date === '2026-10-15'
    const isPast = slot.slot_date < '2026-10-15'
    
    let status: Appointment['status'] = 'Scheduled'
    let durationMins: number | undefined = undefined
    
    if (isPast) {
      if (idx % 12 === 0) {
        status = 'Cancelled'
        slot.status = 'cancelled'
      } else if (idx % 15 === 0) {
        status = 'No Show'
        slot.status = 'booked'
      } else {
        status = 'Completed'
        slot.status = 'booked'
        durationMins = doc.avg_consultation_mins + rng.range(-4, 7)
      }
    } else if (isToday) {
      if (idx % 10 === 0) {
        status = 'Cancelled'
        slot.status = 'cancelled'
      } else if (idx % 5 === 1) {
        status = 'In Progress'
        slot.status = 'booked'
      } else if (idx % 5 === 2) {
        status = 'Checked In'
        slot.status = 'booked'
      } else if (idx % 5 === 3) {
        status = 'Completed'
        slot.status = 'booked'
        durationMins = doc.avg_consultation_mins + rng.range(-2, 4)
      } else {
        status = 'Scheduled'
        slot.status = 'booked'
      }
    } else {
      // Future
      if (idx % 8 === 0) {
        status = 'Cancelled'
        slot.status = 'cancelled'
      } else {
        status = 'Scheduled'
        slot.status = 'booked'
      }
    }

    const appointment: Appointment = {
      appointment_id: aptId,
      appointment_number: aptNumber,
      patient_id: patient.patient_id,
      doctor_id: doc.doctor_id,
      slot_id: slot.slot_id,
      appointment_date: slot.slot_date,
      appointment_time: slot.start_time,
      status,
      token_number: (idx % 10) + 1,
      actual_duration_mins: durationMins,
      checked_in_at: status === 'Checked In' || status === 'In Progress' || status === 'Completed' ? `${slot.slot_date}T08:50:00Z` : undefined,
      consultation_started_at: status === 'In Progress' || status === 'Completed' ? `${slot.slot_date}T${slot.start_time}Z` : undefined,
      consultation_completed_at: status === 'Completed' ? `${slot.slot_date}T${slot.end_time}Z` : undefined,
      created_at: '2026-10-05T09:00:00Z',
      patient,
      doctor: doc,
      slot,
    }

    appointments.push(appointment)

    // Generate Bill for Completed or Checked In
    if (status === 'Completed' || status === 'Checked In' || status === 'Scheduled') {
      const isPaid = status === 'Completed' && idx % 3 !== 0
      bills.push({
        bill_id: `bill-${aptCounter}`,
        bill_number: `INV-2026-${(1000 + aptCounter).toString()}`,
        appointment_id: aptId,
        patient_id: patient.patient_id,
        consultation_fee: doc.consultation_fee,
        additional_charges: idx % 4 === 0 ? 150 : 0,
        discount: idx % 10 === 0 ? 50 : 0,
        total_amount: doc.consultation_fee + (idx % 4 === 0 ? 150 : 0) - (idx % 10 === 0 ? 50 : 0),
        payment_status: isPaid ? 'Paid' : 'Pending',
        payment_method: isPaid ? (idx % 2 === 0 ? 'UPI' : 'Card') : undefined,
        generated_at: `${slot.slot_date}T09:00:00Z`,
        patient,
        appointment,
      })
    }

    // Trigger Slot Recovery record if cancelled
    if (status === 'Cancelled') {
      slotRecoveries.push({
        recovery_id: `rec-${slotRecoveries.length + 1}`,
        cancelled_appointment_id: aptId,
        slot_id: slot.slot_id,
        match_score: idx % 2 === 0 ? 88.5 : 92.0,
        time_compatibility: 0.9,
        waiting_age_factor: 0.85,
        status: idx % 3 === 0 ? 'confirmed' : 'available',
        confirmed_at: idx % 3 === 0 ? '2026-10-15T11:00:00Z' : undefined,
        confirmed_by: idx % 3 === 0 ? 'usr-rec-01' : undefined,
        created_at: `${slot.slot_date}T09:30:00Z`,
        slot,
        cancelled_appointment: appointment,
      })
    }

    aptCounter++
  })

  // 5. WAITLIST (50 Realistic Waitlisted Patients)
  const waitlists: Waitlist[] = []
  const specialties = doctorSpecs.map((d) => d.specialty)

  for (let i = 1; i <= 50; i++) {
    const p = patients[rng.range(0, patients.length - 1)]
    const spec = specialties[i % specialties.length]
    const matchedDoc = doctors.find((d) => d.specialty === spec)
    const reqDaysAgo = rng.range(1, 14)
    const reqDate = new Date(Date.now() - reqDaysAgo * 86400000).toISOString()

    waitlists.push({
      waitlist_id: `wl-${i.toString().padStart(3, '0')}`,
      patient_id: p.patient_id,
      doctor_id: i % 2 === 0 && matchedDoc ? matchedDoc.doctor_id : undefined,
      specialty: spec,
      preferred_date: '2026-10-15',
      preferred_time_start: i % 2 === 0 ? '09:00:00' : '14:00:00',
      preferred_time_end: i % 2 === 0 ? '12:00:00' : '17:00:00',
      status: i % 5 === 0 ? 'fulfilled' : 'active',
      request_timestamp: reqDate,
      created_at: reqDate,
      patient: p,
      doctor: matchedDoc,
    })
  }

  // 6. MEDICINES & BATCHES (100 Batches across Essential Hospital Drugs)
  const drugCatalogs = [
    { code: 'MED-AMX-500', name: 'Amoxicillin 500mg', generic: 'Amoxicillin', cat: 'Antibiotics', form: 'Capsule', uom: 'Strip (10s)', reorder: 80 },
    { code: 'MED-PCM-650', name: 'Paracetamol 650mg', generic: 'Paracetamol', cat: 'Analgesics', form: 'Tablet', uom: 'Strip (15s)', reorder: 150 },
    { code: 'MED-AZI-500', name: 'Azithromycin 500mg', generic: 'Azithromycin', cat: 'Antibiotics', form: 'Tablet', uom: 'Strip (3s)', reorder: 60 },
    { code: 'MED-PAN-040', name: 'Pantoprazole 40mg', generic: 'Pantoprazole Sodium', cat: 'Antacids', form: 'Tablet', uom: 'Strip (10s)', reorder: 100 },
    { code: 'MED-MET-500', name: 'Metformin 500mg', generic: 'Metformin HCl', cat: 'Antidiabetics', form: 'Tablet', uom: 'Strip (10s)', reorder: 120 },
    { code: 'MED-AML-005', name: 'Amlodipine 5mg', generic: 'Amlodipine Besylate', cat: 'Antihypertensives', form: 'Tablet', uom: 'Strip (10s)', reorder: 90 },
    { code: 'MED-ATO-020', name: 'Atorvastatin 20mg', generic: 'Atorvastatin Calcium', cat: 'Cardiovascular', form: 'Tablet', uom: 'Strip (10s)', reorder: 80 },
    { code: 'MED-CET-010', name: 'Cetirizine 10mg', generic: 'Cetirizine HCl', cat: 'Antihistamines', form: 'Tablet', uom: 'Strip (10s)', reorder: 70 },
    { code: 'MED-CEF-200', name: 'Cefixime 200mg', generic: 'Cefixime Trihydrate', cat: 'Antibiotics', form: 'Tablet', uom: 'Strip (10s)', reorder: 50 },
    { code: 'MED-CIP-500', name: 'Ciprofloxacin 500mg', generic: 'Ciprofloxacin', cat: 'Antibiotics', form: 'Tablet', uom: 'Strip (10s)', reorder: 60 },
    { code: 'MED-IBU-400', name: 'Ibuprofen 400mg', generic: 'Ibuprofen', cat: 'Analgesics', form: 'Tablet', uom: 'Strip (10s)', reorder: 80 },
    { code: 'MED-TEL-040', name: 'Telmisartan 40mg', generic: 'Telmisartan', cat: 'Antihypertensives', form: 'Tablet', uom: 'Strip (10s)', reorder: 75 },
    { code: 'MED-ORS-POW', name: 'Electrolyte ORS Sachet', generic: 'Oral Rehydration Salts', cat: 'Electrolytes', form: 'Tablet', uom: 'Sachet (21.8g)', reorder: 200 },
    { code: 'MED-SAL-INH', name: 'Salbutamol Inhaler 100mcg', generic: 'Salbutamol', cat: 'Respiratory', form: 'Syrup', uom: 'Canister (200 doses)', reorder: 40 },
    { code: 'MED-INS-REG', name: 'Regular Insulin 40IU/ml', generic: 'Human Insulin', cat: 'Antidiabetics', form: 'Injection', uom: 'Vial (10ml)', reorder: 35 },
  ]

  const medicines: Medicine[] = drugCatalogs.map((m, idx) => ({
    medicine_id: `med-${idx + 1}`,
    medicine_code: m.code,
    name: m.name,
    generic_name: m.generic,
    category: m.cat,
    dosage_form: m.form as any,
    unit_of_measure: m.uom,
    reorder_level: m.reorder,
    description: `Standard hospital formulary grade ${m.name}.`,
    created_at: '2026-08-01T08:00:00Z',
    updated_at: '2026-08-01T08:00:00Z',
  }))

  const medicineBatches: MedicineBatch[] = []
  const stockMovements: StockMovement[] = []
  let batchCounter = 1

  // Generate 100 batches across medicines with strategic expiry distributions:
  // - 10 expired batches
  // - 15 batches expiring in <= 7 days
  // - 25 batches expiring in <= 30 days
  // - 50 batches healthy (> 30 days up to 2 years)
  medicines.forEach((med, mIdx) => {
    // 6-7 batches per medicine to total 100
    const batchesForMed = mIdx < 10 ? 7 : 6

    for (let b = 1; b <= batchesForMed; b++) {
      if (batchCounter > 100) break
      const batchId = `batch-${batchCounter.toString().padStart(3, '0')}`
      const batchNum = `BN-2026-${mIdx + 1}${b}-${rng.range(100, 999)}`
      
      let expiryDate: string
      let mfgDate: string
      let expiryStatus: MedicineBatch['expiry_status'] = 'healthy'

      if (batchCounter <= 10) {
        // Expired (e.g. 5-30 days ago)
        expiryDate = '2026-10-01'
        mfgDate = '2025-04-01'
        expiryStatus = 'expired'
      } else if (batchCounter <= 25) {
        // Expiring in <= 7 days (Urgent FEFO priority)
        expiryDate = '2026-10-20'
        mfgDate = '2025-05-01'
        expiryStatus = 'urgent_7d'
      } else if (batchCounter <= 50) {
        // Expiring in <= 30 days (Warning)
        expiryDate = '2026-11-10'
        mfgDate = '2025-06-01'
        expiryStatus = 'warning_30d'
      } else {
        // Healthy
        expiryDate = '2027-08-15'
        mfgDate = '2026-02-01'
        expiryStatus = 'healthy'
      }

      const qtyReceived = rng.range(100, 500)
      const currentStock = expiryStatus === 'expired' ? rng.range(5, 25) : rng.range(20, qtyReceived)
      const unitCost = rng.range(15, 250)
      const sellingPrice = Math.round(unitCost * 1.35)

      const batch: MedicineBatch = {
        batch_id: batchId,
        medicine_id: med.medicine_id,
        batch_number: batchNum,
        manufacture_date: mfgDate,
        expiry_date: expiryDate,
        quantity_received: qtyReceived,
        current_stock: currentStock,
        unit_purchase_price: unitCost,
        unit_selling_price: sellingPrice,
        supplier_name: 'Apex Pharma Distributors Ltd.',
        created_at: '2026-09-01T08:00:00Z',
        medicine: med,
        expiry_status: expiryStatus,
      }

      medicineBatches.push(batch)

      // Initial receipt movement
      stockMovements.push({
        movement_id: `mov-${batchCounter * 2 - 1}`,
        batch_id: batchId,
        movement_type: 'INFLOW_RECEIPT',
        quantity: qtyReceived,
        previous_stock: 0,
        new_stock: qtyReceived,
        reason: 'Initial warehouse intake inspection verified.',
        performed_by: 'usr-inv-01',
        movement_timestamp: `${mfgDate}T10:00:00Z`,
        batch,
      })

      // If stock was dispensed
      if (qtyReceived > currentStock) {
        stockMovements.push({
          movement_id: `mov-${batchCounter * 2}`,
          batch_id: batchId,
          movement_type: 'OUTFLOW_DISPENSE',
          quantity: qtyReceived - currentStock,
          previous_stock: qtyReceived,
          new_stock: currentStock,
          reason: 'Prescription dispensing to Outpatient Clinic.',
          performed_by: 'usr-inv-01',
          movement_timestamp: '2026-10-14T14:30:00Z',
          batch,
        })
      }

      batchCounter++
    }
  })

  // 7. AUDIT LOGS
  const auditLogs: AuditLog[] = [
    {
      log_id: 'audit-001',
      user_id: 'usr-admin-01',
      action_type: 'SYSTEM_INITIALIZED',
      table_name: 'profiles',
      record_id: 'usr-admin-01',
      new_values: { system: 'CareBridge 360', status: 'ONLINE', database: 'PostgreSQL 16' },
      created_at: '2026-10-15T08:00:00Z',
    },
    {
      log_id: 'audit-002',
      user_id: 'usr-rec-01',
      action_type: 'SLOT_RECOVERY_CONFIRMED',
      table_name: 'slot_recovery',
      record_id: 'rec-1',
      new_values: { slot: 'slot-12', patient: 'CB-PAT-1004', match_score: 91.5 },
      created_at: '2026-10-15T09:15:00Z',
    },
    {
      log_id: 'audit-003',
      user_id: 'usr-inv-01',
      action_type: 'STOCK_DISPENSED_FEFO',
      table_name: 'medicine_batches',
      record_id: 'batch-012',
      new_values: { batch: 'BN-2026-21-450', dispensed_qty: 30, remaining_stock: 70 },
      created_at: '2026-10-15T10:30:00Z',
    },
  ]

  return {
    profiles,
    doctors,
    patients,
    doctorSlots,
    appointments,
    waitlists,
    slotRecoveries,
    bills,
    medicines,
    medicineBatches,
    stockMovements,
    auditLogs,
  }
}
