-- ====================================================================
-- CAREBRIDGE 360: Row Level Security (RLS) & Access Control Policies
-- BCSE302L Database Systems - Digital Assignment II
-- ====================================================================

-- Enable RLS on all relational tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE slot_recovery ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to extract user's current role from JWT or profiles table
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS VARCHAR AS $$
DECLARE
    v_role VARCHAR;
BEGIN
    SELECT role INTO v_role 
    FROM profiles 
    WHERE id = auth.uid();
    RETURN COALESCE(v_role, 'anonymous');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. PROFILES POLICIES
-- Users can read all staff profiles; users can update their own profile; admins can manage all
CREATE POLICY "Profiles readable by authenticated users" 
ON profiles FOR SELECT TO authenticated 
USING (true);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Admins full access to profiles" 
ON profiles FOR ALL TO authenticated 
USING (get_current_user_role() = 'admin');

-- 2. PATIENTS POLICIES
-- Admin & Receptionist can insert and update; Doctors can read patient records; Public cannot view
CREATE POLICY "Staff can view patients" 
ON patients FOR SELECT TO authenticated 
USING (get_current_user_role() IN ('admin', 'doctor', 'receptionist'));

CREATE POLICY "Admins and Receptionists can insert patients" 
ON patients FOR INSERT TO authenticated 
WITH CHECK (get_current_user_role() IN ('admin', 'receptionist'));

CREATE POLICY "Admins and Receptionists can update patients" 
ON patients FOR UPDATE TO authenticated 
USING (get_current_user_role() IN ('admin', 'receptionist'));

-- 3. DOCTORS & DOCTOR SLOTS POLICIES
-- Everyone authenticated can view doctors & slots; Admin and Doctor can manage slots
CREATE POLICY "Public & authenticated can view active doctors" 
ON doctors FOR SELECT TO public 
USING (is_active = true);

CREATE POLICY "Admins can manage doctors" 
ON doctors FOR ALL TO authenticated 
USING (get_current_user_role() = 'admin');

CREATE POLICY "All authenticated can view slots" 
ON doctor_slots FOR SELECT TO authenticated 
USING (true);

CREATE POLICY "Doctors and Admin can manage doctor slots" 
ON doctor_slots FOR ALL TO authenticated 
USING (
    get_current_user_role() = 'admin' OR 
    (get_current_user_role() = 'doctor' AND doctor_id IN (SELECT doctor_id FROM doctors WHERE profile_id = auth.uid()))
);

-- 4. APPOINTMENTS POLICIES
-- Receptionist & Admin can book and cancel; Doctor can view assigned and update status (consultation notes)
CREATE POLICY "Staff can view appointments" 
ON appointments FOR SELECT TO authenticated 
USING (
    get_current_user_role() IN ('admin', 'receptionist') OR
    (get_current_user_role() = 'doctor' AND doctor_id IN (SELECT doctor_id FROM doctors WHERE profile_id = auth.uid()))
);

CREATE POLICY "Receptionist and Admin can insert appointments" 
ON appointments FOR INSERT TO authenticated 
WITH CHECK (get_current_user_role() IN ('admin', 'receptionist'));

CREATE POLICY "Staff can update appointments" 
ON appointments FOR UPDATE TO authenticated 
USING (
    get_current_user_role() IN ('admin', 'receptionist') OR
    (get_current_user_role() = 'doctor' AND doctor_id IN (SELECT doctor_id FROM doctors WHERE profile_id = auth.uid()))
);

-- 5. WAITLIST & SLOT RECOVERY POLICIES
-- Receptionists and Admins manage waitlist and slot recoveries
CREATE POLICY "Receptionist and Admin can manage waitlist" 
ON waitlist FOR ALL TO authenticated 
USING (get_current_user_role() IN ('admin', 'receptionist'));

CREATE POLICY "Receptionist and Admin can manage slot recoveries" 
ON slot_recovery FOR ALL TO authenticated 
USING (get_current_user_role() IN ('admin', 'receptionist'));

-- 6. BILLS POLICIES
-- Receptionist and Admin can view and manage billing
CREATE POLICY "Receptionist and Admin can manage bills" 
ON bills FOR ALL TO authenticated 
USING (get_current_user_role() IN ('admin', 'receptionist'));

-- 7. MEDICINES & INVENTORY POLICIES
-- Inventory Manager and Admin have full control; Doctors can view medicines for prescription
CREATE POLICY "All clinical staff can view medicines and batches" 
ON medicines FOR SELECT TO authenticated 
USING (true);

CREATE POLICY "All clinical staff can view batches" 
ON medicine_batches FOR SELECT TO authenticated 
USING (true);

CREATE POLICY "Inventory Manager and Admin can manage medicines" 
ON medicines FOR ALL TO authenticated 
USING (get_current_user_role() IN ('admin', 'inventory_manager'));

CREATE POLICY "Inventory Manager and Admin can manage batches" 
ON medicine_batches FOR ALL TO authenticated 
USING (get_current_user_role() IN ('admin', 'inventory_manager'));

CREATE POLICY "Inventory Manager and Admin can manage stock movements" 
ON stock_movements FOR ALL TO authenticated 
USING (get_current_user_role() IN ('admin', 'inventory_manager'));

-- 8. AUDIT LOGS POLICIES
-- Audit logs are strictly read-only for Admins; no updates or deletes permitted
CREATE POLICY "Admins can view audit logs" 
ON audit_logs FOR SELECT TO authenticated 
USING (get_current_user_role() = 'admin');

CREATE POLICY "System can append audit logs" 
ON audit_logs FOR INSERT TO authenticated 
WITH CHECK (true);
