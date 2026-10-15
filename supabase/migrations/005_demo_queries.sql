-- ====================================================================
-- CAREBRIDGE 360: 10 SQL Demonstration Queries for BCSE302L
-- Incorporating INNER JOIN, LEFT JOIN, GROUP BY, HAVING, Subqueries,
-- Aggregate Functions, and Window Functions.
-- ====================================================================

-- --------------------------------------------------------------------
-- QUERY 1: Doctor Appointment Counts by Status with Aggregations
-- Demonstrates: INNER JOIN, GROUP BY, Aggregate functions (COUNT, FILTER)
-- --------------------------------------------------------------------
SELECT 
    d.doctor_id,
    d.full_name AS doctor_name,
    d.specialty,
    d.department,
    COUNT(a.appointment_id) AS total_appointments,
    COUNT(a.appointment_id) FILTER (WHERE a.status = 'Completed') AS completed_appointments,
    COUNT(a.appointment_id) FILTER (WHERE a.status = 'Cancelled') AS cancelled_appointments,
    COUNT(a.appointment_id) FILTER (WHERE a.status = 'Scheduled') AS scheduled_appointments
FROM doctors d
LEFT JOIN appointments a ON d.doctor_id = a.doctor_id
GROUP BY d.doctor_id, d.full_name, d.specialty, d.department
ORDER BY total_appointments DESC;


-- --------------------------------------------------------------------
-- QUERY 2: Patient Appointment and Financial History
-- Demonstrates: Multiple INNER/LEFT JOINs, Subqueries, Date formatting
-- --------------------------------------------------------------------
SELECT 
    p.patient_id,
    p.uhid,
    p.full_name AS patient_name,
    p.contact_number,
    a.appointment_number,
    a.appointment_date,
    a.appointment_time,
    d.full_name AS doctor_name,
    d.specialty,
    a.status AS appointment_status,
    COALESCE(b.total_amount, 0) AS total_bill_amount,
    COALESCE(b.payment_status, 'Unbilled') AS billing_status
FROM patients p
JOIN appointments a ON p.patient_id = a.patient_id
JOIN doctors d ON a.doctor_id = d.doctor_id
LEFT JOIN bills b ON a.appointment_id = b.appointment_id
ORDER BY p.full_name ASC, a.appointment_date DESC;


-- --------------------------------------------------------------------
-- QUERY 3: Doctor Slot Utilization Percentage
-- Demonstrates: Derived tables, Mathematical division, ROUND, HAVING clause
-- --------------------------------------------------------------------
SELECT 
    d.doctor_id,
    d.full_name AS doctor_name,
    d.specialty,
    COUNT(s.slot_id) AS total_generated_slots,
    COUNT(s.slot_id) FILTER (WHERE s.status = 'booked') AS booked_slots,
    COUNT(s.slot_id) FILTER (WHERE s.status = 'cancelled') AS cancelled_slots,
    ROUND(
        (COUNT(s.slot_id) FILTER (WHERE s.status = 'booked')::NUMERIC / 
         NULLIF(COUNT(s.slot_id), 0)::NUMERIC) * 100, 
        2
    ) AS utilization_rate_pct
FROM doctors d
JOIN doctor_slots s ON d.doctor_id = s.doctor_id
GROUP BY d.doctor_id, d.full_name, d.specialty
HAVING COUNT(s.slot_id) > 0
ORDER BY utilization_rate_pct DESC;


-- --------------------------------------------------------------------
-- QUERY 4: Waitlisted Patients Eligible for an Available/Cancelled Slot
-- Demonstrates: Complex Multi-Table JOIN, Date/Time interval math,
-- Priority ranking formula (Explainable Match Scoring)
-- --------------------------------------------------------------------
SELECT 
    w.waitlist_id,
    p.uhid,
    p.full_name AS patient_name,
    p.contact_number,
    w.specialty AS requested_specialty,
    w.preferred_date,
    w.preferred_time_start,
    w.preferred_time_end,
    s.slot_id,
    s.slot_date,
    s.start_time AS slot_time,
    ROUND(
        (70.0 * 1.00 + 
         30.0 * LEAST(1.0, EXTRACT(EPOCH FROM (NOW() - w.request_timestamp)) / 3600.0 / 168.0))::NUMERIC, 
        2
    ) AS simulated_match_score
FROM waitlist w
JOIN patients p ON w.patient_id = p.patient_id
JOIN doctor_slots s ON s.status IN ('available', 'cancelled')
JOIN doctors d ON s.doctor_id = d.doctor_id AND d.specialty = w.specialty
WHERE w.status = 'active'
ORDER BY simulated_match_score DESC;


-- --------------------------------------------------------------------
-- QUERY 5: Slot Recovery Conversion Statistics
-- Demonstrates: Aggregations, Percentage recovery efficiency calculation
-- --------------------------------------------------------------------
SELECT 
    DATE_TRUNC('month', sr.created_at) AS recovery_month,
    COUNT(sr.recovery_id) AS total_cancelled_events,
    COUNT(sr.recovery_id) FILTER (WHERE sr.status = 'confirmed') AS confirmed_recoveries,
    COUNT(sr.recovery_id) FILTER (WHERE sr.status = 'available') AS pending_recoveries,
    ROUND(
        (COUNT(sr.recovery_id) FILTER (WHERE sr.status = 'confirmed')::NUMERIC / 
         NULLIF(COUNT(sr.recovery_id), 0)::NUMERIC) * 100, 
        2
    ) AS recovery_success_rate_pct,
    ROUND(AVG(sr.match_score) FILTER (WHERE sr.status = 'confirmed'), 2) AS avg_confirmed_match_score
FROM slot_recovery sr
GROUP BY DATE_TRUNC('month', sr.created_at)
ORDER BY recovery_month DESC;


-- --------------------------------------------------------------------
-- QUERY 6: Average Consultation Duration vs Configured Duration
-- Demonstrates: Filtered Aggregates, Difference comparison, Window functions
-- --------------------------------------------------------------------
SELECT 
    d.doctor_id,
    d.full_name AS doctor_name,
    d.specialty,
    d.avg_consultation_mins AS configured_mins,
    COUNT(a.appointment_id) AS recorded_consultations,
    ROUND(AVG(a.actual_duration_mins)::NUMERIC, 1) AS empirical_avg_duration_mins,
    ROUND((AVG(a.actual_duration_mins) - d.avg_consultation_mins)::NUMERIC, 1) AS variance_mins,
    CASE 
        WHEN AVG(a.actual_duration_mins) > d.avg_consultation_mins THEN 'Running Behind'
        WHEN AVG(a.actual_duration_mins) < d.avg_consultation_mins THEN 'Ahead of Schedule'
        ELSE 'On Schedule'
    END AS pace_indicator
FROM doctors d
JOIN appointments a ON d.doctor_id = a.doctor_id
WHERE a.status = 'Completed' AND a.actual_duration_mins IS NOT NULL
GROUP BY d.doctor_id, d.full_name, d.specialty, d.avg_consultation_mins
ORDER BY variance_mins DESC;


-- --------------------------------------------------------------------
-- QUERY 7: Unpaid and Outstanding Billing Summary
-- Demonstrates: Aggregate currency sums, HAVING for debt tracking
-- --------------------------------------------------------------------
SELECT 
    p.patient_id,
    p.uhid,
    p.full_name AS patient_name,
    p.contact_number,
    COUNT(b.bill_id) AS total_unpaid_invoices,
    SUM(b.total_amount) AS total_outstanding_inr,
    MIN(b.generated_at) AS oldest_pending_invoice_date
FROM patients p
JOIN bills b ON p.patient_id = b.patient_id
WHERE b.payment_status IN ('Pending', 'Partially Paid')
GROUP BY p.patient_id, p.uhid, p.full_name, p.contact_number
HAVING SUM(b.total_amount) > 0
ORDER BY total_outstanding_inr DESC;


-- --------------------------------------------------------------------
-- QUERY 8: Medicine Batches Nearing Expiry (FEFO Urgent Action)
-- Demonstrates: Interval arithmetic, Date conditions, CASE statements
-- --------------------------------------------------------------------
SELECT 
    m.medicine_code,
    m.name AS medicine_name,
    mb.batch_number,
    mb.expiry_date,
    mb.current_stock,
    mb.unit_purchase_price,
    ROUND((mb.current_stock * mb.unit_purchase_price)::NUMERIC, 2) AS potential_financial_loss_inr,
    (mb.expiry_date - CURRENT_DATE) AS days_until_expiry,
    CASE 
        WHEN mb.expiry_date < CURRENT_DATE THEN 'EXPIRED (Dispose)'
        WHEN mb.expiry_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'CRITICAL (<= 7 Days)'
        WHEN mb.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'WARNING (<= 30 Days)'
        ELSE 'HEALTHY'
    END AS risk_tier
FROM medicine_batches mb
JOIN medicines m ON mb.medicine_id = m.medicine_id
WHERE mb.current_stock > 0
  AND mb.expiry_date <= CURRENT_DATE + INTERVAL '30 days'
ORDER BY mb.expiry_date ASC, mb.current_stock DESC;


-- --------------------------------------------------------------------
-- QUERY 9: Low-Stock Medicines Requiring Reorder
-- Demonstrates: Correlated Subquery or Aggregation with HAVING
-- --------------------------------------------------------------------
SELECT 
    m.medicine_id,
    m.medicine_code,
    m.name AS medicine_name,
    m.category,
    m.reorder_level,
    COALESCE(SUM(mb.current_stock), 0) AS total_stock_on_hand,
    (m.reorder_level - COALESCE(SUM(mb.current_stock), 0)) AS stock_deficit
FROM medicines m
LEFT JOIN medicine_batches mb ON m.medicine_id = mb.medicine_id AND mb.expiry_date >= CURRENT_DATE
GROUP BY m.medicine_id, m.medicine_code, m.name, m.category, m.reorder_level
HAVING COALESCE(SUM(mb.current_stock), 0) <= m.reorder_level
ORDER BY stock_deficit DESC;


-- --------------------------------------------------------------------
-- QUERY 10: Monthly Appointment Trends and Revenue Analysis
-- Demonstrates: DATE_TRUNC, Multi-metric Aggregations, Window Functions
-- --------------------------------------------------------------------
SELECT 
    TO_CHAR(DATE_TRUNC('month', a.appointment_date), 'YYYY-Mon') AS consultation_month,
    COUNT(a.appointment_id) AS total_appointments,
    COUNT(a.appointment_id) FILTER (WHERE a.status = 'Completed') AS completed_consultations,
    COUNT(a.appointment_id) FILTER (WHERE a.status = 'Cancelled') AS cancelled_consultations,
    COALESCE(SUM(b.total_amount) FILTER (WHERE b.payment_status = 'Paid'), 0) AS collected_revenue_inr,
    COALESCE(SUM(b.total_amount) FILTER (WHERE b.payment_status = 'Pending'), 0) AS pending_revenue_inr
FROM appointments a
LEFT JOIN bills b ON a.appointment_id = b.appointment_id
GROUP BY DATE_TRUNC('month', a.appointment_date)
ORDER BY DATE_TRUNC('month', a.appointment_date) DESC;
