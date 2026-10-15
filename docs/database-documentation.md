# CareBridge 360 — Relational Database Architecture & 3NF Normalization
**BCSE302L Database Systems — Digital Assignment II**

---

## 1. Database Normalization Analysis (Up to 3NF)

A relational database is in Third Normal Form (3NF) if and only if it is in Second Normal Form (2NF) and every non-prime attribute is non-transitively dependent on every candidate key (i.e., $X \to Y$ implies $X$ is a superkey or $Y$ is a prime attribute).

### Step-by-Step Normalization Proof

#### 1. First Normal Form (1NF) Compliance:
- **Atomicity**: All table attributes contain atomic values (single values only). Multi-valued attributes like phone numbers, addresses, and medicine batches are isolated into discrete columns or normalized child tables (`medicine_batches`, `stock_movements`).
- **Uniqueness**: Every relation has an explicit Primary Key (UUID). Repeating groups are strictly eliminated.

#### 2. Second Normal Form (2NF) Compliance:
- **No Partial Dependencies**: In relations with composite candidate keys (e.g., `doctor_slots` with `(doctor_id, slot_date, start_time)` or `medicine_batches` with `(medicine_id, batch_number)`), all non-prime attributes (`status`, `current_stock`, `expiry_date`) depend upon the *entire* candidate key, not a partial subset. Surrogate primary keys (`slot_id`, `batch_id`) are maintained.

#### 3. Third Normal Form (3NF) Compliance:
- **No Transitive Dependencies**: Non-prime attributes depend *solely* on the primary key without intermediary functional dependencies ($X \to Y \to Z$):
  - *Example Violation Avoided*: Storing doctor consultation fee directly on `appointments` would create a transitive dependency: $\text{appointment\_id} \to \text{doctor\_id} \to \text{consultation\_fee}$. Instead, consultation fee is stored once in `doctors` and dynamically billed in `bills`.
  - *Patient UHID & Demographics*: Patient addresses and emergency contacts reside exclusively in `patients`, eliminating redundant duplication in `appointments` and `bills`.
  - *Medicine Stock Aggregation*: Total drug stock is not redundantly stored on `medicines` (which would risk update anomalies); it is aggregated dynamically from `medicine_batches` or computed via indexed views.

---

## 2. Table Catalog & Data Dictionary

### Table 1: `profiles`
Primary Key: `id` (UUID references `auth.users`)  
Purpose: Extended staff and administrative credentials.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, REFERENCES auth.users(id) | Unique user identification |
| `full_name` | VARCHAR(150) | NOT NULL | User display name |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Official email address |
| `phone` | VARCHAR(20) | NULLABLE | Primary mobile number |
| `role` | VARCHAR(30) | NOT NULL, CHECK in ('admin', 'doctor', 'receptionist', 'inventory_manager') | RBAC authorization role |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Profile creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

### Table 2: `staff_roles`
Primary Key: `role_id` (UUID)  
Purpose: Granular permission flags per staff user.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `role_id` | UUID | PRIMARY KEY | Role assignment identifier |
| `user_id` | UUID | NOT NULL, REFERENCES profiles(id) | Associated staff member |
| `role_name` | VARCHAR(50) | NOT NULL | Role designation |
| `permissions`| JSONB | NOT NULL, DEFAULT '[]' | Fine-grained capability array |
| `assigned_by`| UUID | REFERENCES profiles(id) | Admin who granted privileges |

### Table 3: `patients`
Primary Key: `patient_id` (UUID)  
Alternate Key: `uhid` (Unique Hospital Identification)

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `patient_id` | UUID | PRIMARY KEY | Internal surrogate UUID |
| `uhid` | VARCHAR(30) | NOT NULL, UNIQUE | Human-readable patient ID (`CB-PAT-XXXX`) |
| `full_name` | VARCHAR(150) | NOT NULL | Patient legal name |
| `date_of_birth`| DATE | NOT NULL | Patient birth date |
| `gender` | VARCHAR(10) | NOT NULL, CHECK ('Male', 'Female', 'Other') | Biological gender |
| `contact_number`| VARCHAR(20)| NOT NULL | Phone contact |
| `email` | VARCHAR(255) | NOT NULL | Email contact |
| `blood_group` | VARCHAR(5) | CHECK in ('A+','A-','B+','B-','AB+','AB-','O+','O-') | Blood group |
| `address` | TEXT | NOT NULL | Residential address |

### Table 4: `doctors`
Primary Key: `doctor_id` (UUID)

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `doctor_id` | UUID | PRIMARY KEY | Doctor identifier |
| `profile_id` | UUID | REFERENCES profiles(id) | Optional linked authentication profile |
| `full_name` | VARCHAR(150) | NOT NULL | Doctor full name |
| `specialty` | VARCHAR(100) | NOT NULL | Clinical specialty |
| `department` | VARCHAR(100) | NOT NULL | Hospital department |
| `qualification`| VARCHAR(100)| NOT NULL | Medical degrees |
| `consultation_fee`| NUMERIC(10,2)| NOT NULL, CHECK (>= 0) | Base OPD fee in INR |
| `avg_consultation_mins`| INTEGER| NOT NULL, DEFAULT 15, CHECK (> 0) | Configured average minutes per consultation |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Duty status |

### Table 5: `doctor_slots`
Primary Key: `slot_id` (UUID)  
Composite Unique: `(doctor_id, slot_date, start_time)`

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `slot_id` | UUID | PRIMARY KEY | Slot record identifier |
| `doctor_id` | UUID | NOT NULL, REFERENCES doctors(doctor_id) | Attending doctor |
| `slot_date` | DATE | NOT NULL | Consultation calendar date |
| `start_time` | TIME | NOT NULL | Slot starting time |
| `end_time` | TIME | NOT NULL, CHECK (end_time > start_time) | Slot ending time |
| `status` | VARCHAR(20) | NOT NULL, CHECK in ('available', 'booked', 'cancelled', 'blocked') | Slot availability state |

### Table 6: `appointments`
Primary Key: `appointment_id` (UUID)  
Unique Constraints: `appointment_number`, `slot_id`

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `appointment_id` | UUID | PRIMARY KEY | Booking UUID |
| `appointment_number`| VARCHAR(30)| NOT NULL, UNIQUE | Tracking code (`APT-YYYYMMDD-XXXX`) |
| `patient_id` | UUID | NOT NULL, REFERENCES patients(patient_id) | Scheduled patient |
| `doctor_id` | UUID | NOT NULL, REFERENCES doctors(doctor_id) | Assigned doctor |
| `slot_id` | UUID | NOT NULL, REFERENCES doctor_slots(slot_id), UNIQUE | Allocated slot |
| `appointment_date`| DATE | NOT NULL | Calendar date |
| `appointment_time`| TIME | NOT NULL | Time of appointment |
| `status` | VARCHAR(20) | NOT NULL, CHECK in ('Scheduled', 'Checked In', 'In Progress', 'Completed', 'Cancelled', 'No Show') | Operational state |
| `token_number` | INTEGER | NOT NULL | Queue token number |
| `actual_duration_mins`| INTEGER | NULLABLE, CHECK (>= 0) | Recorded duration for empirical wait time learning |

### Table 7: `waitlist`
Primary Key: `waitlist_id` (UUID)

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `waitlist_id` | UUID | PRIMARY KEY | Waitlist ticket UUID |
| `patient_id` | UUID | NOT NULL, REFERENCES patients(patient_id) | Candidate patient |
| `doctor_id` | UUID | REFERENCES doctors(doctor_id) | Preferred doctor (optional) |
| `specialty` | VARCHAR(100) | NOT NULL | Required specialty |
| `preferred_date`| DATE | NOT NULL | Target calendar date |
| `preferred_time_start`| TIME | NOT NULL | Preferred window start |
| `preferred_time_end`| TIME | NOT NULL, CHECK (preferred_time_end > preferred_time_start) | Preferred window end |
| `status` | VARCHAR(20) | NOT NULL, CHECK in ('active', 'matched', 'fulfilled', 'expired', 'cancelled') | Waitlist lifecycle state |
| `request_timestamp`| TIMESTAMPTZ| NOT NULL, DEFAULT NOW() | Exact time patient joined queue |

### Table 8: `slot_recovery` (Primary Novelty)
Primary Key: `recovery_id` (UUID)

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `recovery_id` | UUID | PRIMARY KEY | Recovery event UUID |
| `cancelled_appointment_id`| UUID | NOT NULL, REFERENCES appointments(appointment_id) | Cancelled booking reference |
| `slot_id` | UUID | NOT NULL, REFERENCES doctor_slots(slot_id) | Re-opened doctor slot |
| `waitlist_id` | UUID | REFERENCES waitlist(waitlist_id) | Matched waitlist entry |
| `candidate_patient_id`| UUID | REFERENCES patients(patient_id) | Recommended candidate patient |
| `match_score` | NUMERIC(5,2)| CHECK (0 <= match_score <= 100) | Explainable composite score |
| `time_compatibility`| NUMERIC(4,2)| CHECK (0 <= time_compatibility <= 1) | Schedule window overlap factor |
| `waiting_age_factor`| NUMERIC(4,2)| CHECK (0 <= waiting_age_factor <= 1) | Waiting duration equity factor |
| `status` | VARCHAR(20) | CHECK in ('available', 'candidate_review', 'confirmed', 'declined', 'expired') | Recovery progression state |
| `confirmed_at` | TIMESTAMPTZ | NULLABLE | Timestamp of staff confirmation |

### Table 9: `bills`
Primary Key: `bill_id` (UUID)  
Unique Constraints: `bill_number`, `appointment_id`

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `bill_id` | UUID | PRIMARY KEY | Invoice UUID |
| `bill_number` | VARCHAR(30) | NOT NULL, UNIQUE | Formatted invoice ID |
| `appointment_id`| UUID | NOT NULL, REFERENCES appointments(appointment_id), UNIQUE | 1:1 consultation link |
| `patient_id` | UUID | NOT NULL, REFERENCES patients(patient_id) | Billed patient |
| `consultation_fee`| NUMERIC(10,2)| NOT NULL, CHECK (>= 0) | Doctor charge |
| `additional_charges`| NUMERIC(10,2)| NOT NULL, DEFAULT 0 | Diagnostics / tests |
| `discount` | NUMERIC(10,2)| NOT NULL, DEFAULT 0 | Concession / discount |
| `total_amount` | NUMERIC(10,2)| GENERATED ALWAYS AS (consultation_fee + additional_charges - discount) STORED | Computed payable total |
| `payment_status`| VARCHAR(20) | NOT NULL, CHECK in ('Pending', 'Paid', 'Partially Paid', 'Cancelled') | Settlement state |
| `payment_method`| VARCHAR(20) | CHECK in ('Cash', 'Card', 'UPI', 'Insurance') | Tender method |

### Table 10: `medicines`
Primary Key: `medicine_id` (UUID)  
Unique Constraint: `medicine_code`

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `medicine_id` | UUID | PRIMARY KEY | Drug catalogue UUID |
| `medicine_code`| VARCHAR(30) | NOT NULL, UNIQUE | Hospital formulary code |
| `name` | VARCHAR(150) | NOT NULL | Brand / commercial name |
| `generic_name` | VARCHAR(150) | NOT NULL | Active pharmaceutical ingredient |
| `category` | VARCHAR(100) | NOT NULL | Therapeutic class |
| `dosage_form` | VARCHAR(50) | NOT NULL, CHECK in ('Tablet', 'Syrup', 'Injection', 'Capsule', 'Ointment') | Formulation |
| `reorder_level`| INTEGER | NOT NULL, DEFAULT 50, CHECK (>= 0) | Minimum stock safety threshold |

### Table 11: `medicine_batches` (FEFO Inventory Engine)
Primary Key: `batch_id` (UUID)  
Composite Unique: `(medicine_id, batch_number)`

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `batch_id` | UUID | PRIMARY KEY | Batch UUID |
| `medicine_id` | UUID | NOT NULL, REFERENCES medicines(medicine_id) | Drug reference |
| `batch_number` | VARCHAR(50) | NOT NULL | Manufacturer lot number |
| `manufacture_date`| DATE | NOT NULL | Production date |
| `expiry_date` | DATE | NOT NULL, CHECK (expiry_date > manufacture_date) | Expiration date |
| `quantity_received`| INTEGER | NOT NULL, CHECK (> 0) | Intake shipment count |
| `current_stock`| INTEGER | NOT NULL, CHECK (current_stock >= 0) | Invariant non-negative inventory |
| `unit_purchase_price`| NUMERIC(10,2)| NOT NULL, CHECK (>= 0) | Acquisition cost per unit |
| `unit_selling_price`| NUMERIC(10,2)| NOT NULL, CHECK (unit_selling_price >= unit_purchase_price) | Dispensing price |

### Table 12: `stock_movements`
Primary Key: `movement_id` (UUID)

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `movement_id` | UUID | PRIMARY KEY | Ledger entry UUID |
| `batch_id` | UUID | NOT NULL, REFERENCES medicine_batches(batch_id) | Target batch |
| `movement_type`| VARCHAR(30) | NOT NULL, CHECK in ('INFLOW_RECEIPT', 'OUTFLOW_DISPENSE', 'OUTFLOW_EXPIRED_DISPOSAL', 'ADJUSTMENT') | Transaction category |
| `quantity` | INTEGER | NOT NULL, CHECK (> 0) | Delta units |
| `previous_stock`| INTEGER | NOT NULL, CHECK (>= 0) | Stock level before movement |
| `new_stock` | INTEGER | NOT NULL, CHECK (>= 0) | Stock level after movement |
| `reason` | TEXT | NOT NULL | Clinical or administrative destination |
| `performed_by` | UUID | NOT NULL, REFERENCES profiles(id) | Staff responsible |

### Table 13: `audit_logs`
Primary Key: `log_id` (UUID)

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `log_id` | UUID | PRIMARY KEY | Log entry UUID |
| `user_id` | UUID | REFERENCES profiles(id) | Triggering user |
| `action_type` | VARCHAR(50) | NOT NULL | Operation verb |
| `table_name` | VARCHAR(50) | NOT NULL | Affected relational table |
| `record_id` | UUID | NOT NULL | Affected entity ID |
| `old_values` | JSONB | NULLABLE | Pre-mutation row state |
| `new_values` | JSONB | NULLABLE | Post-mutation row state |
| `ip_address` | VARCHAR(45) | NULLABLE | Network client address |
