-- ====================================================================
-- CAREBRIDGE 360: Normalized Relational PostgreSQL Database Schema (3NF)
-- BCSE302L Database Systems - Digital Assignment II
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    role VARCHAR(30) NOT NULL DEFAULT 'receptionist' CHECK (role IN ('admin', 'doctor', 'receptionist', 'inventory_manager')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. STAFF ROLES TABLE (Granular RBAC)
CREATE TABLE IF NOT EXISTS staff_roles (
    role_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role_name VARCHAR(50) NOT NULL,
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
    assigned_by UUID REFERENCES profiles(id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_role UNIQUE (user_id, role_name)
);

-- 3. PATIENTS TABLE (Synthetic Patient Directory)
CREATE TABLE IF NOT EXISTS patients (
    patient_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uhid VARCHAR(30) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    contact_number VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    blood_group VARCHAR(5) CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    address TEXT NOT NULL,
    preferred_location VARCHAR(100),
    emergency_contact VARCHAR(20),
    registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. DOCTORS TABLE
CREATE TABLE IF NOT EXISTS doctors (
    doctor_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    full_name VARCHAR(150) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    qualification VARCHAR(100) NOT NULL,
    consultation_fee NUMERIC(10, 2) NOT NULL CHECK (consultation_fee >= 0),
    avg_consultation_mins INTEGER NOT NULL DEFAULT 15 CHECK (avg_consultation_mins > 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. DOCTOR SLOTS TABLE
CREATE TABLE IF NOT EXISTS doctor_slots (
    slot_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'booked', 'cancelled', 'blocked')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_doctor_slot UNIQUE (doctor_id, slot_date, start_time),
    CONSTRAINT chk_slot_time CHECK (end_time > start_time)
);

-- 6. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS appointments (
    appointment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_number VARCHAR(30) NOT NULL UNIQUE,
    patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE RESTRICT,
    doctor_id UUID NOT NULL REFERENCES doctors(doctor_id) ON DELETE RESTRICT,
    slot_id UUID NOT NULL REFERENCES doctor_slots(slot_id) ON DELETE RESTRICT UNIQUE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Checked In', 'In Progress', 'Completed', 'Cancelled', 'No Show')),
    consultation_notes TEXT,
    token_number INTEGER NOT NULL,
    checked_in_at TIMESTAMPTZ,
    consultation_started_at TIMESTAMPTZ,
    consultation_completed_at TIMESTAMPTZ,
    actual_duration_mins INTEGER CHECK (actual_duration_mins IS NULL OR actual_duration_mins >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. WAITLIST TABLE
CREATE TABLE IF NOT EXISTS waitlist (
    waitlist_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(doctor_id) ON DELETE SET NULL,
    specialty VARCHAR(100) NOT NULL,
    preferred_date DATE NOT NULL,
    preferred_time_start TIME NOT NULL,
    preferred_time_end TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'matched', 'fulfilled', 'expired', 'cancelled')),
    request_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_waitlist_time CHECK (preferred_time_end > preferred_time_start)
);

-- 8. SLOT RECOVERY TABLE (Primary Novelty)
CREATE TABLE IF NOT EXISTS slot_recovery (
    recovery_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cancelled_appointment_id UUID NOT NULL REFERENCES appointments(appointment_id) ON DELETE CASCADE,
    slot_id UUID NOT NULL REFERENCES doctor_slots(slot_id) ON DELETE CASCADE,
    waitlist_id UUID REFERENCES waitlist(waitlist_id) ON DELETE SET NULL,
    candidate_patient_id UUID REFERENCES patients(patient_id) ON DELETE SET NULL,
    match_score NUMERIC(5, 2) NOT NULL DEFAULT 0.0 CHECK (match_score >= 0 AND match_score <= 100),
    time_compatibility NUMERIC(4, 2) NOT NULL DEFAULT 0.0 CHECK (time_compatibility >= 0 AND time_compatibility <= 1),
    waiting_age_factor NUMERIC(4, 2) NOT NULL DEFAULT 0.0 CHECK (waiting_age_factor >= 0 AND waiting_age_factor <= 1),
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'candidate_review', 'confirmed', 'declined', 'expired')),
    confirmed_at TIMESTAMPTZ,
    confirmed_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. BILLS TABLE
CREATE TABLE IF NOT EXISTS bills (
    bill_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_number VARCHAR(30) NOT NULL UNIQUE,
    appointment_id UUID NOT NULL REFERENCES appointments(appointment_id) ON DELETE RESTRICT UNIQUE,
    patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE RESTRICT,
    consultation_fee NUMERIC(10, 2) NOT NULL CHECK (consultation_fee >= 0),
    additional_charges NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (additional_charges >= 0),
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
    total_amount NUMERIC(10, 2) GENERATED ALWAYS AS (consultation_fee + additional_charges - discount) STORED,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid', 'Partially Paid', 'Cancelled')),
    payment_method VARCHAR(20) CHECK (payment_method IN ('Cash', 'Card', 'UPI', 'Insurance')),
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. MEDICINES TABLE
CREATE TABLE IF NOT EXISTS medicines (
    medicine_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medicine_code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    generic_name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    dosage_form VARCHAR(50) NOT NULL CHECK (dosage_form IN ('Tablet', 'Syrup', 'Injection', 'Capsule', 'Ointment')),
    unit_of_measure VARCHAR(20) NOT NULL DEFAULT 'Units',
    reorder_level INTEGER NOT NULL DEFAULT 50 CHECK (reorder_level >= 0),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. MEDICINE BATCHES TABLE (FEFO Engine)
CREATE TABLE IF NOT EXISTS medicine_batches (
    batch_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medicine_id UUID NOT NULL REFERENCES medicines(medicine_id) ON DELETE CASCADE,
    batch_number VARCHAR(50) NOT NULL,
    manufacture_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    quantity_received INTEGER NOT NULL CHECK (quantity_received > 0),
    current_stock INTEGER NOT NULL CHECK (current_stock >= 0), -- INVARIANT: Stock cannot be negative
    unit_purchase_price NUMERIC(10, 2) NOT NULL CHECK (unit_purchase_price >= 0),
    unit_selling_price NUMERIC(10, 2) NOT NULL CHECK (unit_selling_price >= unit_purchase_price),
    supplier_name VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_medicine_batch UNIQUE (medicine_id, batch_number),
    CONSTRAINT chk_batch_dates CHECK (expiry_date > manufacture_date)
);

-- 12. STOCK MOVEMENTS TABLE (Immutable Audit Ledger)
CREATE TABLE IF NOT EXISTS stock_movements (
    movement_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES medicine_batches(batch_id) ON DELETE CASCADE,
    movement_type VARCHAR(30) NOT NULL CHECK (movement_type IN ('INFLOW_RECEIPT', 'OUTFLOW_DISPENSE', 'OUTFLOW_EXPIRED_DISPOSAL', 'ADJUSTMENT')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    previous_stock INTEGER NOT NULL CHECK (previous_stock >= 0),
    new_stock INTEGER NOT NULL CHECK (new_stock >= 0),
    reason TEXT NOT NULL,
    performed_by UUID NOT NULL REFERENCES profiles(id),
    movement_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- PERFORMANCE INDEXES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_patients_uhid ON patients(uhid);
CREATE INDEX IF NOT EXISTS idx_patients_contact ON patients(contact_number);
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty);
CREATE INDEX IF NOT EXISTS idx_doctor_slots_date_status ON doctor_slots(doctor_id, slot_date, status);
CREATE INDEX IF NOT EXISTS idx_appointments_date_status ON appointments(appointment_date, status);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_waitlist_specialty_status ON waitlist(specialty, status);
CREATE INDEX IF NOT EXISTS idx_slot_recovery_slot ON slot_recovery(slot_id, status);
CREATE INDEX IF NOT EXISTS idx_batches_expiry_stock ON medicine_batches(expiry_date, current_stock);
CREATE INDEX IF NOT EXISTS idx_batches_medicine ON medicine_batches(medicine_id);
CREATE INDEX IF NOT EXISTS idx_audit_table_record ON audit_logs(table_name, record_id);
