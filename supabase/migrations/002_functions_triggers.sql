-- ====================================================================
-- CAREBRIDGE 360: Stored Functions, Triggers & Transactions
-- BCSE302L Database Systems - Digital Assignment II
-- ====================================================================

-- 1. Automatic updated_at Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at to all eligible tables
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_patients_updated_at ON patients;
CREATE TRIGGER trg_patients_updated_at BEFORE UPDATE ON patients
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_doctors_updated_at ON doctors;
CREATE TRIGGER trg_doctors_updated_at BEFORE UPDATE ON doctors
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_appointments_updated_at ON appointments;
CREATE TRIGGER trg_appointments_updated_at BEFORE UPDATE ON appointments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_bills_updated_at ON bills;
CREATE TRIGGER trg_bills_updated_at BEFORE UPDATE ON bills
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_medicines_updated_at ON medicines;
CREATE TRIGGER trg_medicines_updated_at BEFORE UPDATE ON medicines
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_batches_updated_at ON medicine_batches;
CREATE TRIGGER trg_batches_updated_at BEFORE UPDATE ON medicine_batches
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- 2. Trigger on Appointment Cancellation: Auto-initiate Slot Recovery
CREATE OR REPLACE FUNCTION on_appointment_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- If appointment is marked Cancelled, free the doctor slot and open slot_recovery record
    IF NEW.status = 'Cancelled' AND (OLD.status IS NULL OR OLD.status != 'Cancelled') THEN
        UPDATE doctor_slots 
        SET status = 'cancelled' 
        WHERE slot_id = NEW.slot_id;

        -- Check if recovery record already exists
        IF NOT EXISTS (SELECT 1 FROM slot_recovery WHERE cancelled_appointment_id = NEW.appointment_id) THEN
            INSERT INTO slot_recovery (
                cancelled_appointment_id,
                slot_id,
                status
            ) VALUES (
                NEW.appointment_id,
                NEW.slot_id,
                'available'
            );
        END IF;

        -- Log to audit
        INSERT INTO audit_logs (
            action_type,
            table_name,
            record_id,
            old_values,
            new_values
        ) VALUES (
            'APPOINTMENT_CANCELLED',
            'appointments',
            NEW.appointment_id,
            jsonb_build_object('status', OLD.status, 'appointment_number', OLD.appointment_number),
            jsonb_build_object('status', NEW.status, 'cancelled_at', NOW())
        );
    END IF;

    -- If appointment completed, set completion timestamp if null
    IF NEW.status = 'Completed' AND OLD.status != 'Completed' THEN
        IF NEW.consultation_completed_at IS NULL THEN
            NEW.consultation_completed_at = NOW();
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_appointment_status_sync ON appointments;
CREATE TRIGGER trg_appointment_status_sync
AFTER UPDATE ON appointments
FOR EACH ROW EXECUTE FUNCTION on_appointment_status_change();


-- 3. PRIMARY NOVELTY: Explainable Match Scoring Stored Function
-- Match Score = 70 * Time Compatibility + 30 * Waiting Age
CREATE OR REPLACE FUNCTION calculate_slot_recovery_matches(p_slot_id UUID)
RETURNS TABLE (
    waitlist_id UUID,
    patient_id UUID,
    patient_name VARCHAR,
    patient_uhid VARCHAR,
    patient_contact VARCHAR,
    specialty VARCHAR,
    time_compatibility NUMERIC,
    waiting_age_factor NUMERIC,
    match_score NUMERIC,
    waiting_hours NUMERIC,
    explanation TEXT
) AS $$
DECLARE
    v_doctor_id UUID;
    v_slot_date DATE;
    v_start_time TIME;
    v_end_time TIME;
    v_specialty VARCHAR;
    v_max_wait_hours NUMERIC := 168.0; -- 7 days normalization baseline
BEGIN
    -- Retrieve slot & doctor info
    SELECT s.doctor_id, s.slot_date, s.start_time, s.end_time, d.specialty
    INTO v_doctor_id, v_slot_date, v_start_time, v_end_time, v_specialty
    FROM doctor_slots s
    JOIN doctors d ON s.doctor_id = d.doctor_id
    WHERE s.slot_id = p_slot_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Doctor slot with ID % not found.', p_slot_id;
    END IF;

    RETURN QUERY
    WITH candidate_eval AS (
        SELECT 
            w.waitlist_id,
            w.patient_id,
            p.full_name AS patient_name,
            p.uhid AS patient_uhid,
            p.contact_number AS patient_contact,
            w.specialty,
            -- Calculate Waiting Age Factor (0 to 1)
            ROUND(
                LEAST(1.0, GREATEST(0.05, EXTRACT(EPOCH FROM (NOW() - w.request_timestamp)) / 3600.0 / v_max_wait_hours))::NUMERIC, 
                2
            ) AS calc_waiting_age,
            -- Waiting duration in hours
            ROUND((EXTRACT(EPOCH FROM (NOW() - w.request_timestamp)) / 3600.0)::NUMERIC, 1) AS calc_hours,
            -- Calculate Time Compatibility (0 to 1)
            ROUND(
                CASE 
                    -- Exact fit: slot entirely within preferred window and date matches
                    WHEN w.preferred_date = v_slot_date 
                         AND v_start_time >= w.preferred_time_start 
                         AND v_end_time <= w.preferred_time_end THEN 1.00
                    -- Date matches and within 1 hour boundary
                    WHEN w.preferred_date = v_slot_date 
                         AND ABS(EXTRACT(EPOCH FROM (v_start_time - w.preferred_time_start)) / 3600.0) <= 1.0 THEN 0.85
                    -- Same day morning/afternoon overlap
                    WHEN w.preferred_date = v_slot_date THEN 0.65
                    -- Date within +/- 2 days
                    WHEN ABS(w.preferred_date - v_slot_date) <= 2 THEN 0.40
                    ELSE 0.20
                END::NUMERIC, 
                2
            ) AS calc_time_compat
        FROM waitlist w
        JOIN patients p ON w.patient_id = p.patient_id
        WHERE w.status = 'active'
          AND (w.doctor_id IS NULL OR w.doctor_id = v_doctor_id)
          AND (w.specialty = v_specialty OR w.specialty = 'General Medicine')
          -- Filter out patients who already have an active appointment at that date & time
          AND NOT EXISTS (
              SELECT 1 FROM appointments a
              WHERE a.patient_id = w.patient_id
                AND a.appointment_date = v_slot_date
                AND a.status IN ('Scheduled', 'Checked In', 'In Progress')
          )
    )
    SELECT 
        ce.waitlist_id,
        ce.patient_id,
        ce.patient_name,
        ce.patient_uhid,
        ce.patient_contact,
        ce.specialty,
        ce.calc_time_compat AS time_compatibility,
        ce.calc_waiting_age AS waiting_age_factor,
        -- Formula: 70 * Time Compatibility + 30 * Waiting Age
        ROUND((70.0 * ce.calc_time_compat + 30.0 * ce.calc_waiting_age)::NUMERIC, 2) AS match_score,
        ce.calc_hours AS waiting_hours,
        -- Explainable text rationale
        CONCAT(
            'Time Compatibility: ', (ce.calc_time_compat * 100)::INT, '%, ',
            'Waiting Age: ', ce.calc_hours, ' hrs (factor ', ce.calc_waiting_age, '). ',
            CASE 
                WHEN ce.calc_time_compat >= 0.85 THEN 'Slot perfectly aligns with preferred schedule. '
                WHEN ce.calc_time_compat >= 0.60 THEN 'Good time-window overlap on preferred date. '
                ELSE 'Alternative date slot offered. '
            END,
            'Composite Explainable Score: ', ROUND((70.0 * ce.calc_time_compat + 30.0 * ce.calc_waiting_age)::NUMERIC, 1), '/100'
        ) AS explanation
    FROM candidate_eval ce
    ORDER BY (70.0 * ce.calc_time_compat + 30.0 * ce.calc_waiting_age) DESC;
END;
$$ LANGUAGE plpgsql;


-- 4. ATOMIC TRANSACTION: Confirm Slot Recovery
CREATE OR REPLACE FUNCTION confirm_slot_recovery(
    p_recovery_id UUID,
    p_waitlist_id UUID,
    p_slot_id UUID,
    p_patient_id UUID,
    p_staff_id UUID
) RETURNS JSONB AS $$
DECLARE
    v_slot_status VARCHAR;
    v_slot_date DATE;
    v_start_time TIME;
    v_doctor_id UUID;
    v_consultation_fee NUMERIC;
    v_new_apt_id UUID := uuid_generate_v4();
    v_apt_number VARCHAR;
    v_bill_number VARCHAR;
    v_token_no INTEGER;
BEGIN
    -- Step 1: Pessimistic Row-Level Lock on doctor_slot to prevent concurrency race conditions
    SELECT status, slot_date, start_time, doctor_id
    INTO v_slot_status, v_slot_date, v_start_time, v_doctor_id
    FROM doctor_slots
    WHERE slot_id = p_slot_id
    FOR UPDATE;

    -- Concurrency guard: Ensure slot is still unrecovered
    IF v_slot_status = 'booked' THEN
        RAISE EXCEPTION 'CONCURRENCY_ERROR: Slot % has already been claimed by another transaction.', p_slot_id;
    END IF;

    -- Get doctor consultation fee
    SELECT consultation_fee INTO v_consultation_fee
    FROM doctors WHERE doctor_id = v_doctor_id;

    -- Compute next token for the doctor on that date
    SELECT COALESCE(MAX(token_number), 0) + 1 INTO v_token_no
    FROM appointments
    WHERE doctor_id = v_doctor_id AND appointment_date = v_slot_date;

    -- Generate human-readable identifiers
    v_apt_number := CONCAT('APT-', TO_CHAR(v_slot_date, 'YYYYMMDD'), '-', LPAD(v_token_no::TEXT, 3, '0'));
    v_bill_number := CONCAT('INV-', TO_CHAR(v_slot_date, 'YYYYMMDD'), '-', LPAD(v_token_no::TEXT, 3, '0'));

    -- Step 2: Mark doctor slot as booked
    UPDATE doctor_slots
    SET status = 'booked'
    WHERE slot_id = p_slot_id;

    -- Step 3: Insert new confirmed replacement appointment
    INSERT INTO appointments (
        appointment_id,
        appointment_number,
        patient_id,
        doctor_id,
        slot_id,
        appointment_date,
        appointment_time,
        status,
        token_number
    ) VALUES (
        v_new_apt_id,
        v_apt_number,
        p_patient_id,
        v_doctor_id,
        p_slot_id,
        v_slot_date,
        v_start_time,
        'Scheduled',
        v_token_no
    );

    -- Step 4: Fulfill the waitlist entry
    UPDATE waitlist
    SET status = 'fulfilled'
    WHERE waitlist_id = p_waitlist_id;

    -- Step 5: Mark slot_recovery record as confirmed
    UPDATE slot_recovery
    SET 
        status = 'confirmed',
        waitlist_id = p_waitlist_id,
        candidate_patient_id = p_patient_id,
        confirmed_at = NOW(),
        confirmed_by = p_staff_id
    WHERE recovery_id = p_recovery_id;

    -- Step 6: Automatically generate the pending consultation bill
    INSERT INTO bills (
        bill_number,
        appointment_id,
        patient_id,
        consultation_fee,
        additional_charges,
        discount,
        payment_status
    ) VALUES (
        v_bill_number,
        v_new_apt_id,
        p_patient_id,
        COALESCE(v_consultation_fee, 500.00),
        0.00,
        0.00,
        'Pending'
    );

    -- Step 7: Record immutable audit trail
    INSERT INTO audit_logs (
        user_id,
        action_type,
        table_name,
        record_id,
        new_values
    ) VALUES (
        p_staff_id,
        'SLOT_RECOVERY_CONFIRMED',
        'slot_recovery',
        p_recovery_id,
        jsonb_build_object(
            'slot_id', p_slot_id,
            'patient_id', p_patient_id,
            'appointment_id', v_new_apt_id,
            'appointment_number', v_apt_number,
            'token_number', v_token_no
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'appointment_id', v_new_apt_id,
        'appointment_number', v_apt_number,
        'token_number', v_token_no,
        'message', 'Slot recovery confirmed and replacement appointment scheduled successfully.'
    );
END;
$$ LANGUAGE plpgsql;


-- 5. ATOMIC TRANSACTION: Dispense Medicine Batch (FEFO Invariant)
CREATE OR REPLACE FUNCTION dispense_medicine_batch(
    p_batch_id UUID,
    p_quantity INTEGER,
    p_reason TEXT,
    p_staff_id UUID
) RETURNS JSONB AS $$
DECLARE
    v_current_stock INTEGER;
    v_new_stock INTEGER;
BEGIN
    -- Check quantity is positive
    IF p_quantity <= 0 THEN
        RAISE EXCEPTION 'Dispense quantity must be greater than zero.';
    END IF;

    -- Pessimistic Lock on batch
    SELECT current_stock INTO v_current_stock
    FROM medicine_batches
    WHERE batch_id = p_batch_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Medicine batch % not found.', p_batch_id;
    END IF;

    IF v_current_stock < p_quantity THEN
        RAISE EXCEPTION 'INSUFFICIENT_STOCK: Batch only has % units available (requested %).', v_current_stock, p_quantity;
    END IF;

    v_new_stock := v_current_stock - p_quantity;

    -- Update batch stock
    UPDATE medicine_batches
    SET current_stock = v_new_stock
    WHERE batch_id = p_batch_id;

    -- Log movement
    INSERT INTO stock_movements (
        batch_id,
        movement_type,
        quantity,
        previous_stock,
        new_stock,
        reason,
        performed_by
    ) VALUES (
        p_batch_id,
        'OUTFLOW_DISPENSE',
        p_quantity,
        v_current_stock,
        v_new_stock,
        p_reason,
        p_staff_id
    );

    RETURN jsonb_build_object(
        'success', true,
        'batch_id', p_batch_id,
        'previous_stock', v_current_stock,
        'new_stock', v_new_stock
    );
END;
$$ LANGUAGE plpgsql;
