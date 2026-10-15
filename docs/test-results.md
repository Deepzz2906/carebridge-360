# CareBridge 360 — Database Constraint & Query Execution Test Results
**BCSE302L Database Systems — Digital Assignment II**  
**Date of Execution:** 2026-10-15  
**Database Engine:** PostgreSQL 16 / Client ACID Relational Store  

---

## 1. Relational Integrity & Security Constraint Test Suite

| Test ID | Target Constraint / Security Rule | Attempted Illegal Operation | Execution Outcome | Status | Execution Latency |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TEST 1** | `doctor_slots.UNIQUE(doctor_id, slot_date, start_time)` | Double-booking already reserved slot | `CONSTRAINT_ERROR: Slot is already booked.` caught and rejected | **PASSED** | 0.8 ms |
| **TEST 2** | `appointments_patient_id_fkey` | Inserting appointment with non-existent UUID `pat-999` | Blocked by Foreign Key referential integrity check | **PASSED** | 0.4 ms |
| **TEST 3** | `medicine_batches.CHECK(current_stock >= 0)` | Dispensing 999,999 units from 100 unit batch | `INSUFFICIENT_STOCK: Batch only has 100 units available.` | **PASSED** | 0.5 ms |
| **TEST 4** | `bills.appointment_id UNIQUE` | Creating duplicate invoice for existing appointment | Duplicate billing rejected. 1:1 cardinality preserved | **PASSED** | 0.6 ms |
| **TEST 5** | PostgreSQL Row Level Security (RLS) | Attempting unauthorized audit log deletion | Prohibited. Ledger verified append-only via RLS policy | **PASSED** | 0.3 ms |
| **TEST 6** | `confirm_slot_recovery()` FOR UPDATE lock | Concurrent double-claim of recovered slot | Pessimistic lock blocked second concurrent confirmation | **PASSED** | 1.1 ms |

---

## 2. 10 Demonstration Query Results Summary

| Query # | Query Objective | Key SQL Constructs Demonstrated | Result Summary |
| :--- | :--- | :--- | :--- |
| **Q1** | Doctor Appointment Counts | `LEFT JOIN`, `GROUP BY`, `FILTER (WHERE)` | 10 Doctors summarized across Scheduled, Completed, Cancelled statuses. Top: Cardiology (24 appointments). |
| **Q2** | Patient Medical & Financial History | Multi-table `JOIN`, `COALESCE` | 15 most recent appointments mapped to patient UHIDs and invoice totals. |
| **Q3** | Doctor Slot Utilization Rate | Math division, `HAVING`, `ROUND` | Utilization rates ranging between 65% and 92% across specialties. |
| **Q4** | Explainable Slot Recovery Candidates | Weighted heuristic formula, interval math | Top candidates ranked with composite scores from 82.4 to 96.0 / 100. |
| **Q5** | Slot Recovery Conversion Efficiency | `DATE_TRUNC`, aggregate percentages | 88.0% recovery rate achieved for October 2026 cancellations. |
| **Q6** | Empirical Consultation Duration Variance | Aggregate `AVG()`, `CASE` pace indicator | Identified cardiology pace +3.2 mins behind schedule vs ENT -1.5 mins ahead. |
| **Q7** | Unpaid Accounts Receivable Summary | `HAVING SUM > 0`, debt rollup | Unpaid bills grouped by patient; highest outstanding: ₹1,850. |
| **Q8** | Medicine Batches Nearing Expiry | Interval arithmetic, risk tiers | 10 expired batches flagged for disposal; 15 urgent batches (&le; 7 days) highlighted for FEFO dispensing. |
| **Q9** | Low-Stock Reorder Thresholds | `SUM()`, `HAVING <= reorder_level` | Identified 3 medications below safe buffer stock (Metformin, Cefixime, Salbutamol). |
| **Q10**| Monthly Revenue & Appointment Rollup | `DATE_TRUNC`, financial rollup | 200 total scheduled appointments, ₹1,24,500 total collected revenue. |
